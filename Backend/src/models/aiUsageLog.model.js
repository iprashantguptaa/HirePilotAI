const mongoose = require("mongoose")

const aiUsageLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        index: true
    },
    type: {
        type: String,
        enum: [ "interview_report", "resume_pdf", "chat_reply" ],
        required: true
    },
    model: {
        type: String
    },
    promptTokens: { type: Number, default: 0 },
    responseTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
}, {
    timestamps: true
})

aiUsageLogSchema.index({ createdAt: -1 })

const aiUsageLogModel = mongoose.model("AiUsageLog", aiUsageLogSchema)

module.exports = aiUsageLogModel
