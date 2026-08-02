const userModel = require("../models/user.model")
const refreshTokenModel = require("../models/refreshToken.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const config = require("../config/env")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")
const { generateOpaqueToken, hashToken } = require("../utils/token")
const { sendEmail } = require("../utils/email")

// Cookie options for cross-origin authentication
// CRITICAL: sameSite="none" requires secure=true (HTTPS)
// For cross-origin cookies to work: frontend and backend must both be HTTPS in production
// DO NOT set domain - let browser handle it (cookies will be scoped to backend domain)
const baseCookieOptions = {
    httpOnly: true,
    secure: config.isProduction,
    sameSite: config.isProduction ? "none" : "lax",
    // path must be "/" to ensure cookie is sent with all API requests
    path: "/",
    // DO NOT set domain in cross-origin scenarios - browser handles this automatically
}

const accessCookieOptions = { ...baseCookieOptions, maxAge: config.jwtExpiresInMs }
const refreshCookieOptions = { ...baseCookieOptions, maxAge: config.refreshTokenExpiresInMs }

function signAccessToken(user) {
    return jwt.sign(
        { id: user._id, username: user.username, role: user.role },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn }
    )
}

/**
 * Issues a new access + refresh token pair for a user, persists the
 * refresh token's hash, and sets both as httpOnly cookies. Used by
 * register, login, and the refresh endpoint (rotation).
 */
async function issueSession(res, user) {
    const accessToken = signAccessToken(user)
    const { rawToken: refreshToken, tokenHash } = generateOpaqueToken()

    await refreshTokenModel.create({
        user: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + config.refreshTokenExpiresInMs)
    })

    // Log cookie options in development for debugging
    if (!config.isProduction) {
        console.log('[AUTH] Setting cookies with options:', {
            httpOnly: accessCookieOptions.httpOnly,
            secure: accessCookieOptions.secure,
            sameSite: accessCookieOptions.sameSite,
            path: accessCookieOptions.path,
            maxAge: `${accessCookieOptions.maxAge}ms`
        })
    }

    res.cookie("accessToken", accessToken, accessCookieOptions)
    res.cookie("refreshToken", refreshToken, refreshCookieOptions)
}

function publicUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
    }
}

async function sendVerificationEmail(user) {
    const { rawToken, tokenHash } = generateOpaqueToken()

    user.emailVerificationTokenHash = tokenHash
    user.emailVerificationExpires = new Date(Date.now() + config.emailVerificationExpiresInMs)
    await user.save()

    const verifyUrl = `${config.frontendUrl}/verify-email/${rawToken}`

    await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Welcome ${user.username}! Verify your email: ${verifyUrl}`,
        html: `<p>Welcome ${user.username}!</p><p>Verify your email: <a href="${verifyUrl}">${verifyUrl}</a></p>`
    })
}

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in the request body
 * @access Public
 */
const registerUserController = asyncHandler(async function registerUserController(req, res) {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        throw ApiError.badRequest("Please provide username, email and password")
    }

    const isUserAlreadyExists = await userModel.findOne({ $or: [ { username }, { email } ] })

    if (isUserAlreadyExists) {
        throw ApiError.badRequest("Account already exists with this email address or username")
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({ username, email, password: hash })

    await issueSession(res, user)

    // Verification email failures shouldn't block registration -- the
    // account is still usable, the user just stays unverified until they
    // retry or an admin flags it.
    sendVerificationEmail(user).catch(() => { })

    res.status(201).json({
        message: "User registered successfully",
        user: publicUser(user)
    })
})


/**
 * @name loginUserController
 * @description login a user, expects email and password in the request body
 * @access Public
 */
const loginUserController = asyncHandler(async function loginUserController(req, res) {
    const { email, password } = req.body

    const user = await userModel.findOne({ email })

    if (!user) {
        throw ApiError.badRequest("Invalid email or password")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw ApiError.badRequest("Invalid email or password")
    }

    await issueSession(res, user)

    res.status(200).json({
        message: "User loggedIn successfully.",
        user: publicUser(user)
    })
})


/**
 * @name refreshTokenController
 * @description exchanges a valid refresh token cookie for a new access + refresh token pair (rotation).
 * @access public (requires refreshToken cookie)
 */
const refreshTokenController = asyncHandler(async function refreshTokenController(req, res) {
    const rawToken = req.cookies.refreshToken

    if (!rawToken) {
        throw ApiError.unauthorized("Refresh token not provided.")
    }

    const tokenHash = hashToken(rawToken)
    const existing = await refreshTokenModel.findOne({ tokenHash })

    if (!existing) {
        throw ApiError.unauthorized("Invalid refresh token.")
    }

    if (existing.revokedAt || existing.expiresAt < new Date()) {
        // Reuse of an already-rotated (or expired) refresh token is a
        // strong signal the token was stolen -- revoke every session for
        // this user rather than just this one.
        await refreshTokenModel.updateMany(
            { user: existing.user, revokedAt: null },
            { revokedAt: new Date() }
        )
        throw ApiError.unauthorized("Refresh token is no longer valid. Please log in again.")
    }

    const user = await userModel.findById(existing.user)

    if (!user) {
        throw ApiError.unauthorized("Account no longer exists.")
    }

    existing.revokedAt = new Date()
    await existing.save()

    await issueSession(res, user)

    res.status(200).json({ message: "Session refreshed successfully." })
})


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
const logoutUserController = asyncHandler(async function logoutUserController(req, res) {
    const accessToken = req.cookies.accessToken
    const refreshToken = req.cookies.refreshToken

    if (accessToken) {
        await tokenBlacklistModel.create({ token: accessToken })
    }

    if (refreshToken) {
        await refreshTokenModel.updateOne(
            { tokenHash: hashToken(refreshToken) },
            { revokedAt: new Date() }
        )
    }

    res.clearCookie("accessToken", baseCookieOptions)
    res.clearCookie("refreshToken", baseCookieOptions)

    res.status(200).json({
        message: "User logged out successfully"
    })
})

/**
 * @name getMeController
 * @description get the current logged in user details.
 * @access private
 */
const getMeController = asyncHandler(async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    res.status(200).json({
        message: "User details fetched successfully",
        user: publicUser(user)
    })
})

/**
 * @name forgotPasswordController
 * @description generates a password reset token and emails it to the user. Always returns 200 to avoid leaking which emails are registered.
 * @access Public
 */
const forgotPasswordController = asyncHandler(async function forgotPasswordController(req, res) {
    const { email } = req.body

    if (!email) {
        throw ApiError.badRequest("Please provide an email address")
    }

    const user = await userModel.findOne({ email })

    if (user) {
        const { rawToken, tokenHash } = generateOpaqueToken()

        user.passwordResetTokenHash = tokenHash
        user.passwordResetExpires = new Date(Date.now() + config.passwordResetExpiresInMs)
        await user.save()

        const resetUrl = `${config.frontendUrl}/reset-password/${rawToken}`

        await sendEmail({
            to: user.email,
            subject: "Reset your password",
            text: `Reset your password: ${resetUrl}. This link expires in ${config.passwordResetExpiresInMs / 60000} minutes.`,
            html: `<p>Reset your password: <a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in ${config.passwordResetExpiresInMs / 60000} minutes.</p>`
        })
    }

    // Same response whether or not the email exists -- prevents account enumeration.
    res.status(200).json({
        message: "If an account with that email exists, a password reset link has been sent."
    })
})

/**
 * @name resetPasswordController
 * @description sets a new password using a valid, unexpired reset token.
 * @access Public
 */
const resetPasswordController = asyncHandler(async function resetPasswordController(req, res) {
    const { token } = req.params
    const { password } = req.body

    if (!password || password.length < 8) {
        throw ApiError.badRequest("Password must be at least 8 characters long")
    }

    const tokenHash = hashToken(token)

    const user = await userModel.findOne({
        passwordResetTokenHash: tokenHash,
        passwordResetExpires: { $gt: new Date() }
    }).select("+passwordResetTokenHash +passwordResetExpires")

    if (!user) {
        throw ApiError.badRequest("Password reset link is invalid or has expired.")
    }

    user.password = await bcrypt.hash(password, 10)
    user.passwordResetTokenHash = undefined
    user.passwordResetExpires = undefined
    await user.save()

    // Resetting the password invalidates every existing session.
    await refreshTokenModel.updateMany(
        { user: user._id, revokedAt: null },
        { revokedAt: new Date() }
    )

    res.status(200).json({ message: "Password has been reset successfully. Please log in again." })
})

/**
 * @name verifyEmailController
 * @description marks the account's email as verified using a valid, unexpired verification token.
 * @access Public
 */
const verifyEmailController = asyncHandler(async function verifyEmailController(req, res) {
    const { token } = req.params
    const tokenHash = hashToken(token)

    const user = await userModel.findOne({
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpires: { $gt: new Date() }
    }).select("+emailVerificationTokenHash +emailVerificationExpires")

    if (!user) {
        throw ApiError.badRequest("Verification link is invalid or has expired.")
    }

    user.isEmailVerified = true
    user.emailVerificationTokenHash = undefined
    user.emailVerificationExpires = undefined
    await user.save()

    res.status(200).json({ message: "Email verified successfully." })
})

/**
 * @name resendVerificationEmailController
 * @description re-sends the verification email for the logged-in user, if not already verified.
 * @access private
 */
const resendVerificationEmailController = asyncHandler(async function resendVerificationEmailController(req, res) {
    const user = await userModel.findById(req.user.id)

    if (!user) {
        throw ApiError.notFound("User not found.")
    }

    if (user.isEmailVerified) {
        return res.status(200).json({ message: "Email is already verified." })
    }

    await sendVerificationEmail(user)

    res.status(200).json({ message: "Verification email sent." })
})

module.exports = {
    registerUserController,
    loginUserController,
    refreshTokenController,
    logoutUserController,
    getMeController,
    forgotPasswordController,
    resetPasswordController,
    verifyEmailController,
    resendVerificationEmailController
}
