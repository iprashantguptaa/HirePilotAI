const userModel = require("../models/user.model")
const interviewReportModel = require("../models/interviewReport.model")
const chatConversationModel = require("../models/chatConversation.model")
const refreshTokenModel = require("../models/refreshToken.model")
const aiUsageLogModel = require("../models/aiUsageLog.model")
const featureFlagModel = require("../models/featureFlag.model")
const feedbackModel = require("../models/feedback.model")
const auditLogModel = require("../models/auditLog.model")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")
const { recordAuditLog } = require("../utils/auditLog")

function getPagination(req, defaultLimit = 20) {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || defaultLimit))
    return { page, limit, skip: (page - 1) * limit }
}

/**
 * @description Platform-wide stats for the admin dashboard.
 * @access private (admin)
 */
const getDashboardStatsController = asyncHandler(async function getDashboardStatsController(req, res) {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const [
        totalUsers,
        activeUsers,
        totalReports,
        totalConversations,
        matchScoreAgg,
        signupsLast30Days,
        reportsLast30Days,
        openFeedbackCount
    ] = await Promise.all([
        userModel.countDocuments(),
        userModel.countDocuments({ isActive: true }),
        interviewReportModel.countDocuments(),
        chatConversationModel.countDocuments(),
        interviewReportModel.aggregate([
            { $match: { matchScore: { $ne: null } } },
            { $group: { _id: null, avg: { $avg: "$matchScore" } } }
        ]),
        userModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        interviewReportModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
        feedbackModel.countDocuments({ status: "open" })
    ])

    res.status(200).json({
        message: "Dashboard stats fetched successfully.",
        stats: {
            totalUsers,
            activeUsers,
            totalReports,
            totalConversations,
            averageMatchScore: matchScoreAgg[ 0 ] ? Math.round(matchScoreAgg[ 0 ].avg) : null,
            signupsLast30Days,
            reportsLast30Days,
            openFeedbackCount
        }
    })
})

/**
 * @description List users with pagination and optional search.
 * @access private (admin)
 */
const listUsersController = asyncHandler(async function listUsersController(req, res) {
    const { page, limit, skip } = getPagination(req)
    const search = (req.query.search || "").trim()

    const filter = search
        ? { $or: [ { username: new RegExp(search, "i") }, { email: new RegExp(search, "i") } ] }
        : {}

    const [ users, total ] = await Promise.all([
        userModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
            .select("username email role isActive isEmailVerified createdAt"),
        userModel.countDocuments(filter)
    ])

    res.status(200).json({
        message: "Users fetched successfully.",
        users,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
})

/**
 * @description Update a user's role or active status.
 * @access private (admin)
 */
const updateUserController = asyncHandler(async function updateUserController(req, res) {
    const { userId } = req.params
    const { role, isActive } = req.body

    if (userId === req.user.id && (role !== undefined || isActive === false)) {
        throw ApiError.badRequest("You can't change your own role or suspend your own account.")
    }

    const user = await userModel.findById(userId)
    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    if (role !== undefined) {
        if (![ "user", "admin" ].includes(role)) {
            throw ApiError.badRequest("Role must be 'user' or 'admin'.")
        }
        user.role = role
    }

    if (isActive !== undefined) {
        user.isActive = !!isActive
    }

    await user.save()

    await recordAuditLog({
        actorId: req.user.id,
        action: "user.update",
        targetType: "user",
        targetId: user._id.toString(),
        metadata: { role: user.role, isActive: user.isActive }
    })

    res.status(200).json({
        message: "User updated successfully.",
        user: { id: user._id, username: user.username, email: user.email, role: user.role, isActive: user.isActive }
    })
})

/**
 * @description Delete a user and all their associated data.
 * @access private (admin)
 */
const deleteUserController = asyncHandler(async function deleteUserController(req, res) {
    const { userId } = req.params

    if (userId === req.user.id) {
        throw ApiError.badRequest("You can't delete your own account from the admin panel.")
    }

    const user = await userModel.findById(userId)
    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    await Promise.all([
        interviewReportModel.deleteMany({ user: userId }),
        chatConversationModel.deleteMany({ user: userId }),
        refreshTokenModel.deleteMany({ user: userId }),
        userModel.findByIdAndDelete(userId)
    ])

    await recordAuditLog({
        actorId: req.user.id,
        action: "user.delete",
        targetType: "user",
        targetId: userId,
        metadata: { username: user.username, email: user.email }
    })

    res.status(200).json({ message: "User deleted successfully." })
})

/**
 * @description List interview reports across all users, with pagination and search.
 * @access private (admin)
 */
const listInterviewsController = asyncHandler(async function listInterviewsController(req, res) {
    const { page, limit, skip } = getPagination(req)
    const search = (req.query.search || "").trim()

    const filter = search ? { title: new RegExp(search, "i") } : {}

    const [ reports, total ] = await Promise.all([
        interviewReportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
            .populate("user", "username email")
            .select("title matchScore user createdAt"),
        interviewReportModel.countDocuments(filter)
    ])

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        reports,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
})

/**
 * @description Delete any interview report (moderation).
 * @access private (admin)
 */
const deleteInterviewController = asyncHandler(async function deleteInterviewController(req, res) {
    const { interviewId } = req.params

    const report = await interviewReportModel.findByIdAndDelete(interviewId)
    if (!report) {
        throw ApiError.notFound("Interview report not found.")
    }

    await chatConversationModel.deleteMany({ interviewReport: interviewId })

    await recordAuditLog({
        actorId: req.user.id,
        action: "interview.delete",
        targetType: "interviewReport",
        targetId: interviewId,
        metadata: { title: report.title }
    })

    res.status(200).json({ message: "Interview report deleted successfully." })
})

/**
 * @description AI usage totals (by type) plus the most recent log entries.
 * @access private (admin)
 */
const getAiUsageController = asyncHandler(async function getAiUsageController(req, res) {
    const [ totalsByType, recentEntries, overallTotal ] = await Promise.all([
        aiUsageLogModel.aggregate([
            { $group: { _id: "$type", totalTokens: { $sum: "$totalTokens" }, calls: { $sum: 1 } } }
        ]),
        aiUsageLogModel.find().sort({ createdAt: -1 }).limit(50).populate("user", "username"),
        aiUsageLogModel.aggregate([
            { $group: { _id: null, totalTokens: { $sum: "$totalTokens" }, calls: { $sum: 1 } } }
        ])
    ])

    res.status(200).json({
        message: "AI usage fetched successfully.",
        totalsByType,
        overall: overallTotal[ 0 ] || { totalTokens: 0, calls: 0 },
        recentEntries
    })
})

const DEFAULT_FLAGS = [
    { key: "ai_interview_assistant", label: "AI Interview Assistant", description: "Controls whether users can chat with the AI Interview Assistant." }
]

/**
 * @description List feature flags, seeding known defaults on first access so the admin panel isn't empty.
 * @access private (admin)
 */
const listFeatureFlagsController = asyncHandler(async function listFeatureFlagsController(req, res) {
    for (const defaultFlag of DEFAULT_FLAGS) {
        await featureFlagModel.updateOne(
            { key: defaultFlag.key },
            { $setOnInsert: { ...defaultFlag, enabled: true } },
            { upsert: true }
        )
    }

    const flags = await featureFlagModel.find().sort({ key: 1 })

    res.status(200).json({
        message: "Feature flags fetched successfully.",
        flags
    })
})

/**
 * @description Create or update (upsert) a feature flag by key.
 * @access private (admin)
 */
const upsertFeatureFlagController = asyncHandler(async function upsertFeatureFlagController(req, res) {
    const { key } = req.params
    const { label, description, enabled } = req.body

    const flag = await featureFlagModel.findOneAndUpdate(
        { key },
        {
            $set: {
                ...(label !== undefined ? { label } : {}),
                ...(description !== undefined ? { description } : {}),
                ...(enabled !== undefined ? { enabled: !!enabled } : {})
            },
            $setOnInsert: { key, label: label || key }
        },
        { upsert: true, new: true }
    )

    await recordAuditLog({
        actorId: req.user.id,
        action: "feature_flag.update",
        targetType: "featureFlag",
        targetId: key,
        metadata: { enabled: flag.enabled }
    })

    res.status(200).json({
        message: "Feature flag updated successfully.",
        flag
    })
})

/**
 * @description List feedback, optionally filtered by status.
 * @access private (admin)
 */
const listFeedbackController = asyncHandler(async function listFeedbackController(req, res) {
    const { page, limit, skip } = getPagination(req)
    const filter = req.query.status ? { status: req.query.status } : {}

    const [ feedback, total ] = await Promise.all([
        feedbackModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "username email"),
        feedbackModel.countDocuments(filter)
    ])

    res.status(200).json({
        message: "Feedback fetched successfully.",
        feedback,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
})

/**
 * @description Mark a feedback item resolved/open.
 * @access private (admin)
 */
const updateFeedbackController = asyncHandler(async function updateFeedbackController(req, res) {
    const { feedbackId } = req.params
    const { status } = req.body

    if (![ "open", "resolved" ].includes(status)) {
        throw ApiError.badRequest("Status must be 'open' or 'resolved'.")
    }

    const feedback = await feedbackModel.findByIdAndUpdate(feedbackId, { status }, { new: true })
    if (!feedback) {
        throw ApiError.notFound("Feedback not found.")
    }

    res.status(200).json({
        message: "Feedback updated successfully.",
        feedback
    })
})

/**
 * @description Recent admin audit log entries.
 * @access private (admin)
 */
const listAuditLogController = asyncHandler(async function listAuditLogController(req, res) {
    const { page, limit, skip } = getPagination(req, 50)

    const [ entries, total ] = await Promise.all([
        auditLogModel.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("actor", "username"),
        auditLogModel.countDocuments()
    ])

    res.status(200).json({
        message: "Audit log fetched successfully.",
        entries,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
})

module.exports = {
    getDashboardStatsController,
    listUsersController,
    updateUserController,
    deleteUserController,
    listInterviewsController,
    deleteInterviewController,
    getAiUsageController,
    listFeatureFlagsController,
    upsertFeatureFlagController,
    listFeedbackController,
    updateFeedbackController,
    listAuditLogController
}
