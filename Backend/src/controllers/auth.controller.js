const userModel = require("../models/user.model")
const refreshTokenModel = require("../models/refreshToken.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const config = require("../config/env")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")
const { generateOpaqueToken, hashToken, generateOtp } = require("../utils/token")
const { sendEmail } = require("../utils/email")
const { extractAccessToken } = require("../middlewares/auth.middleware")

const OTP_TTL_MS = 10 * 60 * 1000

/**
 * Sends an OTP email. When SMTP is not configured, returns previewOtp so
 * password-reset (and local testing) can still complete without a mailbox.
 * Never echoes the OTP when a real email was sent.
 */
async function dispatchOtpEmail({ to, subject, rawOtp, purpose }) {
    const text = `Your HirePilot AI ${purpose} code is ${rawOtp}. It expires in 10 minutes. If you did not request this, ignore this email.`
    const result = await sendEmail({
        to,
        subject,
        text,
        html: `<p>Your HirePilot AI <strong>${purpose}</strong> code is:</p><p style="font-size:28px;letter-spacing:6px;font-weight:700">${rawOtp}</p><p>It expires in 10 minutes.</p>`
    })

    return {
        delivered: Boolean(result?.delivered),
        previewOtp: result?.loggedOnly ? rawOtp : undefined
    }
}

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
 * refresh token's hash, and sets both as httpOnly cookies. Also returns
 * the raw tokens so the SPA can keep a Bearer fallback when third-party
 * cookies are blocked (phones / Safari / cross-site Vercel↔Render).
 */
async function issueSession(res, user) {
    const accessToken = signAccessToken(user)
    const { rawToken: refreshToken, tokenHash } = generateOpaqueToken()

    await refreshTokenModel.create({
        user: user._id,
        tokenHash,
        expiresAt: new Date(Date.now() + config.refreshTokenExpiresInMs)
    })

    if (!config.isProduction) {
        console.log("[AUTH] Setting cookies with options:", {
            httpOnly: accessCookieOptions.httpOnly,
            secure: accessCookieOptions.secure,
            sameSite: accessCookieOptions.sameSite,
            path: accessCookieOptions.path,
            maxAge: `${accessCookieOptions.maxAge}ms`
        })
    }

    res.cookie("accessToken", accessToken, accessCookieOptions)
    res.cookie("refreshToken", refreshToken, refreshCookieOptions)

    return { accessToken, refreshToken }
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
    const rawUsername = typeof req.body.username === "string" ? req.body.username.trim() : ""
    const rawEmail = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""
    const password = typeof req.body.password === "string" ? req.body.password : ""

    if (!rawUsername || !rawEmail || !password) {
        throw ApiError.badRequest("Please provide username, email and password")
    }

    if (rawUsername.length < 3 || rawUsername.length > 32) {
        throw ApiError.badRequest("Username must be between 3 and 32 characters")
    }

    if (!/^[a-zA-Z0-9._-]+$/.test(rawUsername)) {
        throw ApiError.badRequest("Username can only contain letters, numbers, dots, underscores and hyphens")
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
        throw ApiError.badRequest("Please provide a valid email address")
    }

    if (password.length < 8) {
        throw ApiError.badRequest("Password must be at least 8 characters")
    }

    // Case-insensitive email match so "User@X.com" and "user@x.com" collide.
    const isUserAlreadyExists = await userModel.findOne({
        $or: [
            { username: rawUsername },
            { email: rawEmail }
        ]
    })

    if (isUserAlreadyExists) {
        throw ApiError.badRequest("Account already exists with this email address or username")
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
        username: rawUsername,
        email: rawEmail,
        password: hash
    })

    // Verification email failures shouldn't block registration -- the
    // account is still usable, the user just stays unverified until they
    // retry or an admin flags it.
    sendVerificationEmail(user).catch(() => { })

    const tokens = await issueSession(res, user)

    res.status(201).json({
        message: "User registered successfully",
        user: publicUser(user),
        ...tokens
    })
})


/**
 * @name loginUserController
 * @description Step 1 of login: validate email/password, then send a free OTP.
 *              When SMTP is not configured, skip OTP and issue the session
 *              immediately so production demos are not stuck without email.
 * @access Public
 */
const loginUserController = asyncHandler(async function loginUserController(req, res) {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""
    const password = typeof req.body.password === "string" ? req.body.password : ""

    if (!email || !password) {
        throw ApiError.badRequest("Please provide email and password")
    }

    const user = await userModel.findOne({ email })

    if (!user) {
        throw ApiError.badRequest("Invalid email or password")
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
        throw ApiError.badRequest("Invalid email or password")
    }

    // No mail provider configured → do not ask for an OTP the user can never receive.
    if (!config.smtp.host) {
        const tokens = await issueSession(res, user)
        return res.status(200).json({
            message: "Logged in successfully.",
            user: publicUser(user),
            requiresOtp: false,
            ...tokens
        })
    }

    const { rawOtp, otpHash } = generateOtp()
    user.loginOtpHash = otpHash
    user.loginOtpExpires = new Date(Date.now() + OTP_TTL_MS)
    await user.save()

    let delivery
    try {
        delivery = await dispatchOtpEmail({
            to: user.email,
            subject: "Your HirePilot AI login code",
            rawOtp,
            purpose: "login"
        })
    } catch (err) {
        user.loginOtpHash = undefined
        user.loginOtpExpires = undefined
        await user.save()
        throw ApiError.serviceUnavailable(
            "Could not send the login OTP email. Please try again in a minute."
        )
    }

    if (!delivery.delivered) {
        user.loginOtpHash = undefined
        user.loginOtpExpires = undefined
        await user.save()
        throw ApiError.serviceUnavailable(
            "Login email could not be sent. Check SMTP settings on the server, or try again later."
        )
    }

    res.status(200).json({
        message: "Password correct. Enter the OTP sent to your email to finish signing in.",
        requiresOtp: true,
        email: user.email
    })
})

/**
 * @name verifyLoginOtpController
 * @description Step 2 of login: verify the email OTP and issue session cookies.
 * @access Public
 */
const verifyLoginOtpController = asyncHandler(async function verifyLoginOtpController(req, res) {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""
    const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : ""

    if (!email || !otp) {
        throw ApiError.badRequest("Please provide email and OTP")
    }

    if (!/^\d{6}$/.test(otp)) {
        throw ApiError.badRequest("OTP must be a 6-digit code")
    }

    const user = await userModel.findOne({ email }).select("+loginOtpHash +loginOtpExpires")

    if (!user || !user.loginOtpHash || !user.loginOtpExpires || user.loginOtpExpires < new Date()) {
        throw ApiError.badRequest("OTP is invalid or has expired. Please log in again.")
    }

    if (hashToken(otp) !== user.loginOtpHash) {
        throw ApiError.badRequest("Incorrect OTP. Please try again.")
    }

    user.loginOtpHash = undefined
    user.loginOtpExpires = undefined
    await user.save()

    const tokens = await issueSession(res, user)

    res.status(200).json({
        message: "Logged in successfully.",
        user: publicUser(user),
        ...tokens
    })
})


/**
 * @name refreshTokenController
 * @description exchanges a valid refresh token cookie (or body token) for a
 *              new access + refresh token pair (rotation).
 * @access public
 */
const refreshTokenController = asyncHandler(async function refreshTokenController(req, res) {
    const rawToken = req.cookies.refreshToken
        || (typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "")

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

    const tokens = await issueSession(res, user)

    res.status(200).json({ message: "Session refreshed successfully.", ...tokens })
})


/**
 * @name logoutUserController
 * @description clear token from user cookie and add the token in blacklist
 * @access public
 */
const logoutUserController = asyncHandler(async function logoutUserController(req, res) {
    const accessToken = extractAccessToken(req)
    const refreshToken = req.cookies.refreshToken
        || (typeof req.body?.refreshToken === "string" ? req.body.refreshToken : "")

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
 * @description sends a free 6-digit OTP for password reset. Always returns 200
 *              (with a generic message) to avoid leaking which emails are registered.
 * @access Public
 */
const forgotPasswordController = asyncHandler(async function forgotPasswordController(req, res) {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""

    if (!email) {
        throw ApiError.badRequest("Please provide an email address")
    }

    let previewOtp
    const user = await userModel.findOne({ email })

    if (user) {
        const { rawOtp, otpHash } = generateOtp()
        user.passwordResetOtpHash = otpHash
        user.passwordResetOtpExpires = new Date(Date.now() + OTP_TTL_MS)
        // Clear legacy link-based reset fields if any remain.
        user.passwordResetTokenHash = undefined
        user.passwordResetExpires = undefined
        await user.save()

        const delivery = await dispatchOtpEmail({
            to: user.email,
            subject: "Your HirePilot AI password reset code",
            rawOtp,
            purpose: "password reset"
        })
        previewOtp = delivery.previewOtp
    }

    res.status(200).json({
        message: "If an account with that email exists, a password reset OTP has been sent.",
        ...(previewOtp ? { previewOtp } : {})
    })
})

/**
 * @name resetPasswordWithOtpController
 * @description sets a new password using a valid, unexpired email OTP.
 * @access Public
 */
const resetPasswordWithOtpController = asyncHandler(async function resetPasswordWithOtpController(req, res) {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : ""
    const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : ""
    const password = typeof req.body.password === "string" ? req.body.password : ""

    if (!email || !otp || !password) {
        throw ApiError.badRequest("Please provide email, OTP and a new password")
    }

    if (!/^\d{6}$/.test(otp)) {
        throw ApiError.badRequest("OTP must be a 6-digit code")
    }

    if (password.length < 8) {
        throw ApiError.badRequest("Password must be at least 8 characters long")
    }

    const user = await userModel.findOne({ email }).select("+passwordResetOtpHash +passwordResetOtpExpires")

    if (!user || !user.passwordResetOtpHash || !user.passwordResetOtpExpires || user.passwordResetOtpExpires < new Date()) {
        throw ApiError.badRequest("OTP is invalid or has expired. Please request a new one.")
    }

    if (hashToken(otp) !== user.passwordResetOtpHash) {
        throw ApiError.badRequest("Incorrect OTP. Please try again.")
    }

    user.password = await bcrypt.hash(password, 10)
    user.passwordResetOtpHash = undefined
    user.passwordResetOtpExpires = undefined
    await user.save()

    await refreshTokenModel.updateMany(
        { user: user._id, revokedAt: null },
        { revokedAt: new Date() }
    )

    res.status(200).json({ message: "Password has been reset successfully. Please log in." })
})

/**
 * @name resetPasswordController
 * @description Legacy link-based reset kept for old emails already in the wild.
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
        throw ApiError.badRequest("Password reset link is invalid or has expired. Use Forgot Password to get a new OTP.")
    }

    user.password = await bcrypt.hash(password, 10)
    user.passwordResetTokenHash = undefined
    user.passwordResetExpires = undefined
    await user.save()

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
    verifyLoginOtpController,
    refreshTokenController,
    logoutUserController,
    getMeController,
    forgotPasswordController,
    resetPasswordWithOtpController,
    resetPasswordController,
    verifyEmailController,
    resendVerificationEmailController
}
