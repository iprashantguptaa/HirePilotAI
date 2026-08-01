const { Router } = require("express")
const feedbackController = require("../controllers/feedback.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const feedbackRouter = Router()

/**
 * @route POST /api/feedback
 * @description submit product feedback
 * @access private
 */
feedbackRouter.post("/", authMiddleware.authUser, feedbackController.submitFeedbackController)

module.exports = feedbackRouter
