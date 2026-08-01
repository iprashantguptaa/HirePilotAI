const mongoose = require("mongoose")

const feedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    category: {
        type: String,
        enum: [ "bug", "idea", "praise", "other" ],
        default: "other"
    },
    message: {
        type: String,
        required: true,
        maxlength: 2000
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    status: {
        type: String,
        enum: [ "open", "resolved" ],
        default: "open"
    }
}, {
    timestamps: true
})

const feedbackModel = mongoose.model("Feedback", feedbackSchema)

module.exports = feedbackModel
