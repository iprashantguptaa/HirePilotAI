const chatConversationModel = require("../models/chatConversation.model")
const interviewReportModel = require("../models/interviewReport.model")
const aiUsageLogModel = require("../models/aiUsageLog.model")
const { generateChatReply } = require("../services/ai.service")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")
const logger = require("../utils/logger")
const { isFeatureEnabled } = require("../utils/featureFlags")

const MAX_MESSAGE_LENGTH = 2000
// How many recent turns to send back to the model -- keeps the prompt
// (and cost) bounded on long-running conversations while still giving
// real short-term memory.
const MAX_HISTORY_MESSAGES = 20

/**
 * Summarizes the candidate's other interview prep sessions so the
 * assistant is aware of recurring weak areas across their history, not
 * just the report it's currently scoped to.
 */
async function buildPastReportsSummary(userId, excludeReportId) {
    const otherReports = await interviewReportModel
        .find({ user: userId, _id: { $ne: excludeReportId } })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title matchScore skillGaps createdAt")

    if (!otherReports.length) return null

    return otherReports
        .map((r) => {
            const gaps = (r.skillGaps || []).map((g) => g.skill).join(", ") || "none noted"
            return `- ${r.title || "Untitled role"} (match score ${r.matchScore ?? "N/A"}%): weak areas -- ${gaps}`
        })
        .join("\n")
}

async function getOwnedReportOrThrow(reportId, userId) {
    const report = await interviewReportModel.findOne({ _id: reportId, user: userId })
    if (!report) {
        throw ApiError.notFound("Interview report not found.")
    }
    return report
}

async function findOrCreateConversation(userId, reportId) {
    let conversation = await chatConversationModel.findOne({ user: userId, interviewReport: reportId })
    if (!conversation) {
        conversation = await chatConversationModel.create({ user: userId, interviewReport: reportId, messages: [] })
    }
    return conversation
}

/**
 * @description Fetch (or lazily create) the AI Assistant conversation scoped to a specific interview report.
 * @access private
 */
const getConversationController = asyncHandler(async function getConversationController(req, res) {
    const { interviewId } = req.params

    await getOwnedReportOrThrow(interviewId, req.user.id)
    const conversation = await findOrCreateConversation(req.user.id, interviewId)

    res.status(200).json({
        message: "Conversation fetched successfully.",
        conversation
    })
})

/**
 * @description Send a message to the AI Interview Assistant for a specific interview report and get a reply.
 * @access private
 */
const sendMessageController = asyncHandler(async function sendMessageController(req, res) {
    const { interviewId } = req.params
    const { message } = req.body

    if (!(await isFeatureEnabled("ai_interview_assistant"))) {
        throw ApiError.forbidden("The AI Interview Assistant is temporarily disabled.")
    }

    if (!message || !message.trim()) {
        throw ApiError.badRequest("Message is required.")
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
        throw ApiError.badRequest(`Message is too long (max ${MAX_MESSAGE_LENGTH} characters).`)
    }

    const report = await getOwnedReportOrThrow(interviewId, req.user.id)
    const conversation = await findOrCreateConversation(req.user.id, interviewId)

    const pastReportsSummary = await buildPastReportsSummary(req.user.id, interviewId)
    const recentHistory = conversation.messages.slice(-MAX_HISTORY_MESSAGES)

    const replyResult = await generateChatReply({
        resume: report.resume,
        jobDescription: report.jobDescription,
        pastReportsSummary,
        history: recentHistory,
        userMessage: message.trim()
    })

    conversation.messages.push({ role: "user", content: message.trim() })
    conversation.messages.push({ role: "assistant", content: replyResult.text })
    await conversation.save()

    try {
        await aiUsageLogModel.create({
            user: req.user.id,
            type: "chat_reply",
            model: "gemini-3-flash-preview",
            promptTokens: replyResult.usage?.promptTokens || 0,
            responseTokens: replyResult.usage?.responseTokens || 0,
            totalTokens: replyResult.usage?.totalTokens || 0
        })
    } catch (err) {
        logger.warn(`Failed to record AI usage log: ${err.message}`)
    }

    res.status(200).json({
        message: "Reply generated successfully.",
        reply: replyResult.text,
        conversation
    })
})

module.exports = { getConversationController, sendMessageController }
