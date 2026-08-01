const feedbackModel = require("../models/feedback.model")
const ApiError = require("../utils/ApiError")
const asyncHandler = require("../utils/asyncHandler")

/**
 * @description Submit product feedback (bug report, idea, praise, etc).
 * @access private
 */
const submitFeedbackController = asyncHandler(async function submitFeedbackController(req, res) {
    const { category, message, rating } = req.body

    if (!message || !message.trim()) {
        throw ApiError.badRequest("Please provide a message.")
    }

    const feedback = await feedbackModel.create({
        user: req.user.id,
        category: category || "other",
        message: message.trim(),
        rating: rating || undefined
    })

    res.status(201).json({
        message: "Thanks for the feedback!",
        feedback
    })
})

module.exports = { submitFeedbackController }
