const multer = require("multer")
const ApiError = require("../utils/ApiError")
const logger = require("../utils/logger")
const config = require("../config/env")

/**
 * Translates known third-party error types (Mongoose, Multer, JWT) into
 * an ApiError so the response shape is always consistent, regardless of
 * where in the stack the error originated.
 */
function normalizeError(err) {
    if (err instanceof ApiError) return err

    // Mongoose validation error (e.g. missing required field)
    if (err.name === "ValidationError") {
        const details = Object.values(err.errors || {}).map((e) => e.message)
        return ApiError.badRequest("Validation failed", details)
    }

    // Mongoose invalid ObjectId (e.g. malformed :interviewId param)
    if (err.name === "CastError") {
        return ApiError.badRequest(`Invalid value for '${err.path}'`)
    }

    // Mongo duplicate key error (e.g. race condition on unique email/username)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[ 0 ] || "field"
        return ApiError.conflict(`An account with this ${field} already exists`)
    }

    // File upload errors (e.g. resume over the 3MB limit)
    if (err instanceof multer.MulterError) {
        return ApiError.badRequest(`File upload error: ${err.message}`)
    }

    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
        return ApiError.unauthorized("Invalid or expired token")
    }

    return ApiError.internal(config.isProduction ? "Something went wrong" : err.message)
}

/**
 * Express error-handling middleware. Must be registered last, after all
 * routes and the notFoundHandler.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
    const normalized = normalizeError(err)

    if (normalized.statusCode >= 500) {
        logger.error(`${req.method} ${req.originalUrl} -> ${err.message}`, config.isProduction ? undefined : err.stack)
    } else {
        logger.warn(`${req.method} ${req.originalUrl} -> ${normalized.message}`)
    }

    res.status(normalized.statusCode).json({
        message: normalized.message,
        ...(normalized.details ? { details: normalized.details } : {}),
        ...(config.isProduction ? {} : { stack: err.stack })
    })
}

module.exports = errorHandler
