const mongoose = require("mongoose")

const auditLogSchema = new mongoose.Schema({
    actor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    action: {
        type: String,
        required: true
    },
    targetType: {
        type: String
    },
    targetId: {
        type: String
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
})

auditLogSchema.index({ createdAt: -1 })

const auditLogModel = mongoose.model("AuditLog", auditLogSchema)

module.exports = auditLogModel
