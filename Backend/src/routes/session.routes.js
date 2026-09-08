const express = require("express")
const rateLimit = require("express-rate-limit")
const authMiddleware = require("../middlewares/auth.middleware")
const sessionController = require("../controllers/session.controller")

const sessionRouter = express.Router()

const aiSessionLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 60,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => String(req.user?.id || "anonymous"),
    message: { message: "You have scored enough answers for now. Try again in an hour." }
})

/**
 * @route POST /api/session/
 * @description start a live practice interview session and get its first question.
 * @access private
 */
sessionRouter.post("/", authMiddleware.authUser, aiSessionLimiter, sessionController.startSessionController)

/**
 * @route GET /api/session/
 * @description list the logged in user's practice sessions.
 * @access private
 */
sessionRouter.get("/", authMiddleware.authUser, sessionController.getAllSessionsController)

/**
 * @route GET /api/session/:sessionId
 * @description get a single practice session including its full transcript.
 * @access private
 */
sessionRouter.get("/:sessionId", authMiddleware.authUser, sessionController.getSessionController)

/**
 * @route POST /api/session/:sessionId/answer
 * @description submit an answer, get it scored, and receive the next question.
 * @access private
 */
sessionRouter.post("/:sessionId/answer", authMiddleware.authUser, aiSessionLimiter, sessionController.submitAnswerController)

/**
 * @route POST /api/session/:sessionId/complete
 * @description end a session early and generate its performance report.
 * @access private
 */
sessionRouter.post("/:sessionId/complete", authMiddleware.authUser, aiSessionLimiter, sessionController.completeSessionController)

/**
 * @route DELETE /api/session/:sessionId
 * @description delete a practice session.
 * @access private
 */
sessionRouter.delete("/:sessionId", authMiddleware.authUser, sessionController.deleteSessionController)

module.exports = sessionRouter
