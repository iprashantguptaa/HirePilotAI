const bcrypt = require("bcryptjs")
const pdfParse = require("pdf-parse")
const userModel = require("../models/user.model")
const interviewReportModel = require("../models/interviewReport.model")
const chatConversationModel = require("../models/chatConversation.model")
const refreshTokenModel = require("../models/refreshToken.model")
const tokenBlacklistModel = require("../models/blacklist.model")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

const ALLOWED_PROFILE_FIELDS = [ "headline", "bio", "skills", "experience", "education" ]

function serializeProfile(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        avatar: user.avatar || null,
        headline: user.headline || "",
        bio: user.bio || "",
        skills: user.skills || [],
        experience: user.experience || [],
        education: user.education || [],
        resume: user.resume?.text
            ? { fileName: user.resume.fileName, uploadedAt: user.resume.uploadedAt }
            : null,
        notificationPreferences: user.notificationPreferences,
        createdAt: user.createdAt
    }
}

/**
 * @description Get the logged-in user's full profile.
 * @access private
 */
const getProfileController = asyncHandler(async function getProfileController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    res.status(200).json({
        message: "Profile fetched successfully.",
        profile: serializeProfile(user)
    })
})

/**
 * @description Update personal information: headline, bio, skills, experience, education.
 * @access private
 */
const updateProfileController = asyncHandler(async function updateProfileController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    if (req.body.skills !== undefined && req.body.skills.length > 30) {
        throw ApiError.badRequest("Please limit skills to 30 entries.")
    }
    if (req.body.experience !== undefined && req.body.experience.length > 20) {
        throw ApiError.badRequest("Please limit experience to 20 entries.")
    }
    if (req.body.education !== undefined && req.body.education.length > 15) {
        throw ApiError.badRequest("Please limit education to 15 entries.")
    }

    for (const field of ALLOWED_PROFILE_FIELDS) {
        if (req.body[ field ] !== undefined) {
            user[ field ] = req.body[ field ]
        }
    }

    await user.save()

    res.status(200).json({
        message: "Profile updated successfully.",
        profile: serializeProfile(user)
    })
})

/**
 * @description Update notification preferences.
 * @access private
 */
const updateNotificationPreferencesController = asyncHandler(async function updateNotificationPreferencesController(req, res) {
    const { emailOnReportReady, productUpdates } = req.body

    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    if (emailOnReportReady !== undefined) user.notificationPreferences.emailOnReportReady = !!emailOnReportReady
    if (productUpdates !== undefined) user.notificationPreferences.productUpdates = !!productUpdates

    await user.save()

    res.status(200).json({
        message: "Notification preferences updated successfully.",
        notificationPreferences: user.notificationPreferences
    })
})

/**
 * @description Upload/replace the profile avatar image.
 * @access private
 */
const uploadAvatarController = asyncHandler(async function uploadAvatarController(req, res) {
    if (!req.file) {
        throw ApiError.badRequest("Avatar image is required.")
    }

    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        { avatar: dataUri },
        { new: true }
    )

    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    res.status(200).json({
        message: "Avatar updated successfully.",
        avatar: user.avatar
    })
})

/**
 * @description Remove the profile avatar image.
 * @access private
 */
const deleteAvatarController = asyncHandler(async function deleteAvatarController(req, res) {
    await userModel.findByIdAndUpdate(req.user.id, { $unset: { avatar: "" } })

    res.status(200).json({ message: "Avatar removed successfully." })
})

/**
 * @description Upload a default resume to reuse when starting new interviews.
 * @access private
 */
const uploadResumeController = asyncHandler(async function uploadResumeController(req, res) {
    if (!req.file) {
        throw ApiError.badRequest("Resume file is required.")
    }

    const parsed = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()

    const user = await userModel.findByIdAndUpdate(
        req.user.id,
        { resume: { text: parsed.text, fileName: req.file.originalname, uploadedAt: new Date() } },
        { new: true }
    )

    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    res.status(200).json({
        message: "Resume uploaded successfully.",
        resume: { fileName: user.resume.fileName, uploadedAt: user.resume.uploadedAt }
    })
})

/**
 * @description Remove the saved default resume.
 * @access private
 */
const deleteResumeController = asyncHandler(async function deleteResumeController(req, res) {
    await userModel.findByIdAndUpdate(req.user.id, { $unset: { resume: "" } })

    res.status(200).json({ message: "Resume removed successfully." })
})

/**
 * @description Change the account password while logged in (requires current password).
 * Revokes every existing session -- the user will need to log in again on other devices.
 * @access private
 */
const changePasswordController = asyncHandler(async function changePasswordController(req, res) {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
        throw ApiError.badRequest("Current and new password are required.")
    }

    if (newPassword.length < 8) {
        throw ApiError.badRequest("New password must be at least 8 characters long.")
    }

    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
        throw ApiError.badRequest("Current password is incorrect.")
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()

    await refreshTokenModel.updateMany(
        { user: user._id, revokedAt: null },
        { revokedAt: new Date() }
    )

    res.status(200).json({ message: "Password changed successfully. Please log in again." })
})

/**
 * @description Permanently delete the account and all associated data (interview reports, chat history, sessions).
 * @access private
 */
const deleteAccountController = asyncHandler(async function deleteAccountController(req, res) {
    const { password } = req.body

    if (!password) {
        throw ApiError.badRequest("Please confirm your password to delete your account.")
    }

    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw ApiError.badRequest("Password is incorrect.")
    }

    await Promise.all([
        interviewReportModel.deleteMany({ user: user._id }),
        chatConversationModel.deleteMany({ user: user._id }),
        refreshTokenModel.deleteMany({ user: user._id }),
        userModel.findByIdAndDelete(user._id)
    ])

    const accessToken = req.cookies.accessToken
    if (accessToken) {
        await tokenBlacklistModel.create({ token: accessToken })
    }

    res.clearCookie("accessToken", { httpOnly: true })
    res.clearCookie("refreshToken", { httpOnly: true })

    res.status(200).json({ message: "Account deleted successfully." })
})

module.exports = {
    getProfileController,
    updateProfileController,
    updateNotificationPreferencesController,
    uploadAvatarController,
    deleteAvatarController,
    uploadResumeController,
    deleteResumeController,
    changePasswordController,
    deleteAccountController
}
