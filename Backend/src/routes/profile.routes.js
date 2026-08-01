const { Router } = require("express")
const rateLimit = require("express-rate-limit")
const profileController = require("../controllers/profile.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const upload = require("../middlewares/file.middleware")
const avatarUpload = require("../middlewares/avatarUpload.middleware")

const profileRouter = Router()

// Sensitive account actions (password change, deletion) get a tighter
// limit than general profile reads/updates.
const sensitiveProfileLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later." }
})

profileRouter.use(authMiddleware.authUser)

/**
 * @route GET /api/profile
 * @description get the logged-in user's full profile
 */
profileRouter.get("/", profileController.getProfileController)

/**
 * @route PATCH /api/profile
 * @description update headline, bio, skills, experience, education
 */
profileRouter.patch("/", profileController.updateProfileController)

/**
 * @route PATCH /api/profile/notifications
 * @description update notification preferences
 */
profileRouter.patch("/notifications", profileController.updateNotificationPreferencesController)

/**
 * @route POST /api/profile/avatar
 * @description upload/replace the profile avatar image
 */
profileRouter.post("/avatar", avatarUpload.single("avatar"), profileController.uploadAvatarController)

/**
 * @route DELETE /api/profile/avatar
 * @description remove the profile avatar image
 */
profileRouter.delete("/avatar", profileController.deleteAvatarController)

/**
 * @route POST /api/profile/resume
 * @description upload a default resume to reuse when starting new interviews
 */
profileRouter.post("/resume", upload.single("resume"), profileController.uploadResumeController)

/**
 * @route DELETE /api/profile/resume
 * @description remove the saved default resume
 */
profileRouter.delete("/resume", profileController.deleteResumeController)

/**
 * @route POST /api/profile/change-password
 * @description change the account password (requires current password)
 */
profileRouter.post("/change-password", sensitiveProfileLimiter, profileController.changePasswordController)

/**
 * @route DELETE /api/profile
 * @description permanently delete the account and all associated data
 */
profileRouter.delete("/", sensitiveProfileLimiter, profileController.deleteAccountController)

module.exports = profileRouter
