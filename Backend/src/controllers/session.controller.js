const interviewSessionModel = require("../models/interviewSession.model")
const interviewReportModel = require("../models/interviewReport.model")
const userModel = require("../models/user.model")
const aiUsageLogModel = require("../models/aiUsageLog.model")
const {
    generateSessionQuestion,
    scoreSessionAnswer,
    generateSessionAnalytics
} = require("../services/ai.service")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")
const logger = require("../utils/logger")

const MAX_ANSWER_LENGTH = 5000
const RUBRIC_KEYS = [ "relevance", "depth", "structure", "clarity", "specificity" ]

/**
 * Records AI token usage for the admin usage dashboard. A logging failure
 * must never turn a successful AI call into a failed request.
 */
async function logAiUsage(userId, type, usage) {
    try {
        await aiUsageLogModel.create({
            user: userId,
            type,
            model: "gemini-3-flash-preview",
            promptTokens: usage?.promptTokens || 0,
            responseTokens: usage?.responseTokens || 0,
            totalTokens: usage?.totalTokens || 0
        })
    } catch (err) {
        logger.warn(`Failed to record AI usage log: ${err.message}`)
    }
}

async function getOwnedSessionOrThrow(sessionId, userId) {
    const session = await interviewSessionModel.findOne({ _id: sessionId, user: userId })
    if (!session) {
        throw ApiError.notFound("Practice session not found.")
    }
    return session
}

function getAnsweredTurns(session) {
    return (session.turns || []).filter((turn) => typeof turn.overallScore === "number")
}

function round(value) {
    return Math.round(value * 10) / 10
}

/**
 * Averages the per-answer rubric across the session. Computed here rather
 * than asked of the model so the numbers shown to the candidate always
 * reconcile with the individual answer scores they saw during the session.
 */
function computeRubricAverages(answeredTurns) {
    if (!answeredTurns.length) return undefined

    return RUBRIC_KEYS.reduce((averages, key) => {
        const values = answeredTurns
            .map((turn) => turn.rubric?.[ key ])
            .filter((value) => typeof value === "number")

        averages[ key ] = values.length
            ? round(values.reduce((sum, value) => sum + value, 0) / values.length)
            : undefined

        return averages
    }, {})
}

function computeOverallScore(answeredTurns) {
    if (!answeredTurns.length) return 0
    const total = answeredTurns.reduce((sum, turn) => sum + (turn.overallScore || 0), 0)
    return Math.round(total / answeredTurns.length)
}

/**
 * Asks the model for the next question and appends it to the session as an
 * unanswered turn. Kept separate so both session creation and answer
 * submission drive the interview forward through the same path.
 */
async function appendNextQuestion(session, userId) {
    const questionNumber = (session.turns?.length || 0) + 1

    const { data, usage } = await generateSessionQuestion({
        resume: session.resume,
        jobDescription: session.jobDescription,
        mode: session.mode,
        priorTurns: getAnsweredTurns(session),
        questionNumber,
        plannedQuestions: session.plannedQuestions
    })

    session.turns.push({
        questionNumber,
        question: data.question,
        category: data.category,
        intention: data.intention,
        isFollowUp: Boolean(data.isFollowUp),
        askedAt: new Date()
    })

    await logAiUsage(userId, "session_question", usage)

    return session.turns[ session.turns.length - 1 ]
}

/**
 * Generates and stores the end-of-session analytics, then closes the session.
 * Numeric aggregates are computed locally; the model supplies only the
 * qualitative narrative.
 */
async function finalizeSession(session, userId) {
    const answeredTurns = getAnsweredTurns(session)

    // Drop a trailing question the candidate never answered so it doesn't
    // show up in the report as a blank exchange.
    session.turns = session.turns.filter((turn) => typeof turn.overallScore === "number")

    let narrative = {}
    if (answeredTurns.length) {
        try {
            const { data, usage } = await generateSessionAnalytics({
                title: session.title,
                jobDescription: session.jobDescription,
                turns: answeredTurns
            })
            narrative = data
            await logAiUsage(userId, "session_analytics", usage)
        } catch (err) {
            // The scores are the valuable part and they're already saved --
            // losing the narrative shouldn't lose the whole session.
            logger.warn(`Failed to generate session analytics: ${err.message}`)
        }
    }

    session.report = {
        overallScore: computeOverallScore(answeredTurns),
        rubricAverages: computeRubricAverages(answeredTurns),
        verdict: narrative.verdict,
        strengths: narrative.strengths || [],
        weaknesses: narrative.weaknesses || [],
        recommendations: narrative.recommendations || []
    }
    session.status = "completed"
    session.completedAt = new Date()

    await session.save()
    return session
}

/**
 * Fills in the qualitative half of a completed report that was lost to an AI
 * outage at completion time.
 *
 * The numeric scores are computed locally so they are always present; only the
 * narrative can go missing. Without this, a provider blip during the final
 * request would leave the candidate with a permanently half-empty report.
 */
async function backfillSessionNarrative(session, userId) {
    const needsNarrative = session.status === "completed"
        && session.report
        && !session.report.verdict
        && session.turns?.length > 0

    if (!needsNarrative) return false

    try {
        const { data, usage } = await generateSessionAnalytics({
            title: session.title,
            jobDescription: session.jobDescription,
            turns: session.turns
        })

        session.report.verdict = data.verdict
        session.report.strengths = data.strengths || []
        session.report.weaknesses = data.weaknesses || []
        session.report.recommendations = data.recommendations || []

        await session.save()
        await logAiUsage(userId, "session_analytics", usage)

        return true
    } catch (err) {
        logger.warn(`Narrative backfill for session ${session._id} still failing: ${err.message}`)
        return false
    }
}

/**
 * @description Start a live practice interview session and return its first question.
 * @access private
 */
const startSessionController = asyncHandler(async function startSessionController(req, res) {
    const { interviewReportId, mode, plannedQuestions } = req.body

    let title
    let jobDescription
    let resume

    if (interviewReportId) {
        const report = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id })
        if (!report) {
            throw ApiError.notFound("Interview report not found.")
        }
        title = report.title
        jobDescription = report.jobDescription
        resume = report.resume
    } else {
        jobDescription = req.body.jobDescription
        if (!jobDescription || !jobDescription.trim()) {
            throw ApiError.badRequest("A job description is required to start a practice session.")
        }
        title = (req.body.title || "").trim() || "Practice Session"

        // Fall back to the resume saved on the user's profile so they don't
        // have to re-upload it just to practise.
        const user = await userModel.findById(req.user.id).select("resume")
        resume = user?.resume?.text
    }

    const requestedQuestions = Number(plannedQuestions)
    const session = await interviewSessionModel.create({
        user: req.user.id,
        interviewReport: interviewReportId || undefined,
        title,
        jobDescription,
        resume,
        mode: [ "technical", "behavioral", "mixed" ].includes(mode) ? mode : "mixed",
        plannedQuestions: Number.isFinite(requestedQuestions)
            ? Math.min(Math.max(requestedQuestions, 3), 15)
            : 6,
        turns: []
    })

    await appendNextQuestion(session, req.user.id)
    await session.save()

    res.status(201).json({
        message: "Practice session started.",
        session
    })
})

/**
 * @description Submit an answer to the current question. Scores it, then either
 * asks the next question or closes the session out with a final report.
 * @access private
 */
const submitAnswerController = asyncHandler(async function submitAnswerController(req, res) {
    const { sessionId } = req.params
    const { answer } = req.body

    if (typeof answer !== "string" || !answer.trim()) {
        throw ApiError.badRequest("An answer is required.")
    }

    if (answer.length > MAX_ANSWER_LENGTH) {
        throw ApiError.badRequest(`That answer is too long (max ${MAX_ANSWER_LENGTH} characters).`)
    }

    const session = await getOwnedSessionOrThrow(sessionId, req.user.id)

    if (session.status !== "in_progress") {
        throw ApiError.badRequest("This practice session has already ended.")
    }

    const pendingTurn = session.turns.find((turn) => typeof turn.overallScore !== "number")
    if (!pendingTurn) {
        throw ApiError.badRequest("There is no open question to answer in this session.")
    }

    const { data: score, usage } = await scoreSessionAnswer({
        resume: session.resume,
        jobDescription: session.jobDescription,
        question: pendingTurn.question,
        category: pendingTurn.category,
        intention: pendingTurn.intention,
        answer: answer.trim()
    })

    pendingTurn.answer = answer.trim()
    pendingTurn.overallScore = score.overallScore
    pendingTurn.rubric = score.rubric
    pendingTurn.feedback = score.feedback
    pendingTurn.answeredAt = new Date()

    // Persist the grading before generating the next question. If question
    // generation then fails (the provider is flaky), the candidate keeps the
    // score they earned instead of having to answer again.
    await session.save()

    await logAiUsage(req.user.id, "session_score", usage)

    const answeredCount = getAnsweredTurns(session).length

    if (answeredCount >= session.plannedQuestions) {
        await finalizeSession(session, req.user.id)

        return res.status(200).json({
            message: "Practice session complete.",
            scoredTurn: pendingTurn,
            nextQuestion: null,
            completed: true,
            session
        })
    }

    const nextTurn = await appendNextQuestion(session, req.user.id)
    await session.save()

    res.status(200).json({
        message: "Answer scored.",
        scoredTurn: pendingTurn,
        nextQuestion: nextTurn,
        completed: false,
        session
    })
})

/**
 * @description End a session early and generate its report from whatever was answered.
 * @access private
 */
const completeSessionController = asyncHandler(async function completeSessionController(req, res) {
    const { sessionId } = req.params

    const session = await getOwnedSessionOrThrow(sessionId, req.user.id)

    if (session.status !== "in_progress") {
        throw ApiError.badRequest("This practice session has already ended.")
    }

    if (!getAnsweredTurns(session).length) {
        session.status = "abandoned"
        session.completedAt = new Date()
        await session.save()

        return res.status(200).json({
            message: "Practice session discarded -- no questions were answered.",
            session
        })
    }

    await finalizeSession(session, req.user.id)

    res.status(200).json({
        message: "Practice session complete.",
        session
    })
})

/**
 * @description Get a single practice session, including its full transcript.
 * @access private
 */
const getSessionController = asyncHandler(async function getSessionController(req, res) {
    const session = await getOwnedSessionOrThrow(req.params.sessionId, req.user.id)

    // Self-heal a session that has no open question but hasn't finished yet.
    // That state is reachable if question generation failed after the previous
    // answer was saved; without this the candidate would be stuck on a session
    // they can neither continue nor meaningfully complete.
    const needsQuestion = session.status === "in_progress"
        && !session.turns.some((turn) => typeof turn.overallScore !== "number")
        && getAnsweredTurns(session).length < session.plannedQuestions

    if (needsQuestion) {
        await appendNextQuestion(session, req.user.id)
        await session.save()
    }

    await backfillSessionNarrative(session, req.user.id)

    res.status(200).json({
        message: "Practice session fetched successfully.",
        session
    })
})

/**
 * @description List the logged-in user's practice sessions (summary fields only).
 * @access private
 */
const getAllSessionsController = asyncHandler(async function getAllSessionsController(req, res) {
    const sessions = await interviewSessionModel
        .find({ user: req.user.id, status: { $ne: "abandoned" } })
        .sort({ createdAt: -1 })
        .select("title mode status report.overallScore plannedQuestions createdAt completedAt")

    res.status(200).json({
        message: "Practice sessions fetched successfully.",
        sessions
    })
})

/**
 * @description Delete a practice session.
 * @access private
 */
const deleteSessionController = asyncHandler(async function deleteSessionController(req, res) {
    const session = await interviewSessionModel.findOneAndDelete({
        _id: req.params.sessionId,
        user: req.user.id
    })

    if (!session) {
        throw ApiError.notFound("Practice session not found.")
    }

    res.status(200).json({ message: "Practice session deleted successfully." })
})

module.exports = {
    startSessionController,
    submitAnswerController,
    completeSessionController,
    getSessionController,
    getAllSessionsController,
    deleteSessionController
}
