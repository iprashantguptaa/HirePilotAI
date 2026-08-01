const { Router } = require("express")
const rateLimit = require("express-rate-limit")
const chatController = require("../controllers/chat.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const chatRouter = Router()

// AI calls cost money and take a few seconds each -- cap how fast a
// single user can send messages, separately from the general API limit.
const chatMessageLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "You're sending messages too quickly. Please slow down." }
})

/**
 * @route GET /api/chat/:interviewId
 * @description fetch (or lazily create) the assistant conversation for a specific interview report
 * @access private
 */
chatRouter.get("/:interviewId", authMiddleware.authUser, chatController.getConversationController)

/**
 * @route POST /api/chat/:interviewId/message
 * @description send a message to the AI Interview Assistant and get a reply
 * @access private
 */
chatRouter.post("/:interviewId/message", authMiddleware.authUser, chatMessageLimiter, chatController.sendMessageController)

module.exports = chatRouter
