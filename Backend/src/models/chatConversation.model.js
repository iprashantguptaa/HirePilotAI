const mongoose = require("mongoose")

const chatMessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: [ "user", "assistant" ],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false
})

const chatConversationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true
    },
    interviewReport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewReport",
        required: true
    },
    messages: [ chatMessageSchema ]
}, {
    timestamps: true
})

// One assistant conversation per user per interview report.
chatConversationSchema.index({ user: 1, interviewReport: 1 }, { unique: true })

const chatConversationModel = mongoose.model("ChatConversation", chatConversationSchema)

module.exports = chatConversationModel
