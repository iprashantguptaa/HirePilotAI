const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const userModel = require("../models/user.model")
const config = require("../config/env")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

function extractAccessToken(req) {
    const fromCookie = req.cookies?.accessToken
    if (fromCookie) return fromCookie

    const header = req.get("authorization") || ""
    const match = /^Bearer\s+(.+)$/i.exec(header)
    return match ? match[ 1 ].trim() : null
}

/**
 * Verifies the short-lived access token from cookie OR Authorization Bearer.
 * Bearer support keeps sessions alive when third-party cookies are blocked
 * (common on phones / Safari when API is on a different host).
 */
const authUser = asyncHandler(async function authUser(req, res, next) {
    const token = extractAccessToken(req)

    if (!token) {
        if (!config.isProduction) {
            const allCookies = Object.keys(req.cookies || {})
            console.log("[AUTH] No access token. Available cookies:", allCookies)
            console.log("[AUTH] Has refresh token:", !!req.cookies.refreshToken)
            console.log("[AUTH] Has Authorization:", Boolean(req.get("authorization")))
            console.log("[AUTH] Request origin:", req.get("origin"))
        }

        throw ApiError.unauthorized("Access token not provided.")
    }

    const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token })

    if (isTokenBlacklisted) {
        throw ApiError.unauthorized("Token is invalid.")
    }

    let decoded
    try {
        decoded = jwt.verify(token, config.jwtSecret)
    } catch (err) {
        throw ApiError.unauthorized("Invalid or expired access token.")
    }

    // Re-checked against the DB (not just the JWT claim) on every request
    // so that an admin suspending an account or changing a role takes
    // effect immediately, instead of only at the user's next login.
    const currentUser = await userModel.findById(decoded.id).select("role isActive")

    if (!currentUser) {
        throw ApiError.unauthorized("Account no longer exists.")
    }

    if (!currentUser.isActive) {
        throw ApiError.forbidden("This account has been suspended.")
    }

    req.user = { id: decoded.id, username: decoded.username, role: currentUser.role }
    next()
})

/**
 * Role-based access control. Use after authUser, e.g.:
 *   router.get("/admin/x", authUser, authorizeRoles("admin"), controller)
 */
function authorizeRoles(...allowedRoles) {
    return function checkRole(req, res, next) {
        if (!req.user) {
            return next(ApiError.unauthorized("Authentication required."))
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(ApiError.forbidden("You do not have permission to perform this action."))
        }

        next()
    }
}

module.exports = { authUser, authorizeRoles, extractAccessToken }
