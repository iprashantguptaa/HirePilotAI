/**
 * Standardized application error. Throw this (or subclass it) from anywhere
 * in the request lifecycle -- controllers, services, middleware -- and the
 * centralized error handler will turn it into a consistent JSON response.
 */
class ApiError extends Error {
    constructor(statusCode, message, details = null) {
        super(message)
        this.name = "ApiError"
        this.statusCode = statusCode
        this.details = details
        this.isOperational = true

        Error.captureStackTrace(this, this.constructor)
    }

    static badRequest(message, details) {
        return new ApiError(400, message, details)
    }

    static unauthorized(message = "Unauthorized") {
        return new ApiError(401, message)
    }

    static forbidden(message = "Forbidden") {
        return new ApiError(403, message)
    }

    static notFound(message = "Resource not found") {
        return new ApiError(404, message)
    }

    static conflict(message) {
        return new ApiError(409, message)
    }

    static internal(message = "Something went wrong") {
        return new ApiError(500, message)
    }

    /**
     * For upstream dependencies that are temporarily unavailable (e.g. the AI
     * provider is overloaded). Distinct from `internal` so clients can tell
     * "try again shortly" apart from "this request is broken".
     */
    static serviceUnavailable(message = "This service is temporarily unavailable. Please try again shortly.") {
        return new ApiError(503, message)
    }
}

module.exports = ApiError
