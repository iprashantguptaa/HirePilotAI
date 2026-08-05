const { Router } = require('express')
const rateLimit = require('express-rate-limit')
const authController = require("../controllers/auth.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const authRouter = Router()

// Brute-force / credential-stuffing protection on the endpoints attackers
// actually target. Tighter than the global API rate limiter.
const sensitiveAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many attempts, please try again later." }
})

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", sensitiveAuthLimiter, authController.registerUserController)


/**
 * @route POST /api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", sensitiveAuthLimiter, authController.loginUserController)

/**
 * @route POST /api/auth/verify-login-otp
 * @description finish login by verifying the free email OTP
 * @access Public
 */
authRouter.post("/verify-login-otp", sensitiveAuthLimiter, authController.verifyLoginOtpController)


/**
 * @route POST /api/auth/refresh-token
 * @description exchange a valid refresh token cookie for a new access + refresh token pair
 * @access public (requires refreshToken cookie)
 */
authRouter.post("/refresh-token", authController.refreshTokenController)


/**
 * @route GET|POST /api/auth/logout
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
authRouter.get("/logout", authController.logoutUserController)
authRouter.post("/logout", authController.logoutUserController)


/**
 * @route GET /api/auth/get-me
 * @description get the current logged in user details
 * @access private
 */
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)


/**
 * @route POST /api/auth/forgot-password
 * @description request a password reset email
 * @access Public
 */
authRouter.post("/forgot-password", sensitiveAuthLimiter, authController.forgotPasswordController)

/**
 * @route POST /api/auth/reset-password-otp
 * @description set a new password using a free email OTP
 * @access Public
 */
authRouter.post("/reset-password-otp", sensitiveAuthLimiter, authController.resetPasswordWithOtpController)

/**
 * @route POST /api/auth/reset-password/:token
 * @description set a new password using a valid reset token (legacy link flow)
 * @access Public
 */
authRouter.post("/reset-password/:token", sensitiveAuthLimiter, authController.resetPasswordController)


/**
 * @route GET /api/auth/verify-email/:token
 * @description verify the account's email using a valid verification token
 * @access Public
 */
authRouter.get("/verify-email/:token", authController.verifyEmailController)


/**
 * @route POST /api/auth/resend-verification
 * @description resend the email verification link for the logged-in user
 * @access private
 */
authRouter.post("/resend-verification", authMiddleware.authUser, sensitiveAuthLimiter, authController.resendVerificationEmailController)


module.exports = authRouter
