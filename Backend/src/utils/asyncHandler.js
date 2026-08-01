/**
 * Wraps an async Express controller/middleware so any thrown error or
 * rejected promise is forwarded to next(err) instead of crashing the
 * process or hanging the request. Express 5 does this automatically for
 * route handlers, but wrapping explicitly keeps behavior consistent and
 * makes intent obvious as more middleware layers get added.
 */
function asyncHandler(fn) {
    return function wrappedHandler(req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}

module.exports = asyncHandler
