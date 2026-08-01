const mongoose = require("mongoose")

const featureFlagSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    label: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    enabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

const featureFlagModel = mongoose.model("FeatureFlag", featureFlagSchema)

module.exports = featureFlagModel
