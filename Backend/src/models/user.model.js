const mongoose = require("mongoose")


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
    },

    email: {
        type: String,
        unique: true,
        required: true,
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: [ "user", "admin" ],
        default: "user"
    },

    isActive: {
        type: Boolean,
        default: true
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    // Hashes only -- the raw token is emailed to the user and never stored.
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },

    passwordResetTokenHash: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    // Free email OTP for login (second step) and password reset.
    // Raw OTP is never stored — only a bcrypt/hash of it.
    loginOtpHash: { type: String, select: false },
    loginOtpExpires: { type: Date, select: false },
    passwordResetOtpHash: { type: String, select: false },
    passwordResetOtpExpires: { type: Date, select: false },

    // ---- Profile ----
    // Stored as a base64 data URI -- fine for small avatars without
    // needing an external object-storage provider configured. For
    // higher traffic, swap this for an S3/Cloudinary URL instead.
    avatar: { type: String },
    headline: { type: String, maxlength: 120 },
    bio: { type: String, maxlength: 500 },
    skills: [ { type: String, trim: true } ],

    experience: [ {
        title: { type: String, required: true },
        company: { type: String, required: true },
        startDate: { type: Date },
        endDate: { type: Date },
        current: { type: Boolean, default: false },
        description: { type: String, maxlength: 1000 }
    } ],

    education: [ {
        school: { type: String, required: true },
        degree: { type: String },
        field: { type: String },
        startDate: { type: Date },
        endDate: { type: Date }
    } ],

    // A default resume the candidate can reuse when starting a new
    // interview, separate from the per-report resume snapshot stored on
    // each InterviewReport.
    resume: {
        text: { type: String },
        fileName: { type: String },
        uploadedAt: { type: Date }
    },

    notificationPreferences: {
        emailOnReportReady: { type: Boolean, default: true },
        productUpdates: { type: Boolean, default: false }
    }
}, {
    timestamps: true
})

const userModel = mongoose.model("users", userSchema)

module.exports = userModel