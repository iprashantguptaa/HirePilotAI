const ApiError = require("../utils/ApiError")

/**
 * Catches any request that didn't match a route and forwards a clean
 * 404 to the centralized error handler, instead of Express's default
 * HTML "Cannot GET /x" page.
 */
function notFoundHandler(req, res, next) {
    next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}

module.exports = notFoundHandler
