const jwt = require("jsonwebtoken")
const tokenBlacklistModel = require("../models/blacklist.model")
const userModel = require("../models/user.model")
const config = require("../config/env")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

/**
 * Verifies the short-lived access token cookie. Renamed from "token" to
 * "accessToken" to be explicit now that a separate "refreshToken" cookie
 * also exists -- httpOnly cookies aren't read by frontend JS, so this
 * rename doesn't affect the client.
 */
const authUser = asyncHandler(async function authUser(req, res, next) {
    const token = req.cookies.accessToken

    if (!token) {
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

module.exports = { authUser, authorizeRoles }
