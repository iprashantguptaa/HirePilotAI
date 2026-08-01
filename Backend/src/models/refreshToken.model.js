const mongoose = require("mongoose")

const refreshTokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    revokedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

// MongoDB TTL index -- documents are automatically removed once expiresAt
// has passed, so revoked/expired refresh tokens don't accumulate forever.
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const refreshTokenModel = mongoose.model("RefreshToken", refreshTokenSchema)

module.exports = refreshTokenModel
