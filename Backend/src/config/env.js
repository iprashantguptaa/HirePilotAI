const REQUIRED_VARS = [ "MONGO_URI", "JWT_SECRET", "GOOGLE_GENAI_API_KEY" ]

/**
 * Parses a duration string like "1d", "15m", "30s", "2h" into milliseconds.
 * Falls back to a sane default if the value is missing or malformed.
 */
function parseDurationToMs(value, fallbackMs) {
    if (!value) return fallbackMs

    const match = /^(\d+)\s*(ms|s|m|h|d)$/i.exec(value.trim())
    if (!match) return fallbackMs

    const amount = Number(match[ 1 ])
    const unit = match[ 2 ].toLowerCase()

    const unitToMs = { ms: 1, s: 1000, m: 60 * 1000, h: 60 * 60 * 1000, d: 24 * 60 * 60 * 1000 }

    return amount * unitToMs[ unit ]
}

/**
 * Validates that every required environment variable is present.
 * Throws a single, readable error listing everything that's missing
 * instead of failing later with a confusing runtime error.
 */
function validateEnv() {
    const missing = REQUIRED_VARS.filter((key) => !process.env[ key ] || process.env[ key ].trim() === "")

    if (missing.length > 0) {
        const message = [
            "Missing required environment variable(s):",
            ...missing.map((key) => `  - ${key}`),
            "",
            "Create a Backend/.env file (see Backend/.env.example) and set these before starting the server."
        ].join("\n")

        throw new Error(message)
    }
}

validateEnv()

// Kept for backward compatibility with any existing .env that only sets
// JWT_EXPIRES_IN -- new deployments should set the two below explicitly.
const legacyExpiresIn = process.env.JWT_EXPIRES_IN
const accessTokenExpiresIn = process.env.ACCESS_TOKEN_EXPIRES_IN || legacyExpiresIn || "15m"
const refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d"

const config = {
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
    port: Number(process.env.PORT) || 3000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: accessTokenExpiresIn,
    jwtExpiresInMs: parseDurationToMs(accessTokenExpiresIn, 15 * 60 * 1000),
    refreshTokenExpiresIn,
    refreshTokenExpiresInMs: parseDurationToMs(refreshTokenExpiresIn, 30 * 24 * 60 * 60 * 1000),
    googleGenAiApiKey: process.env.GOOGLE_GENAI_API_KEY,
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
    rateLimit: {
        windowMs: parseDurationToMs(process.env.RATE_LIMIT_WINDOW, 15 * 60 * 1000),
        max: Number(process.env.RATE_LIMIT_MAX) || 300
    },
    passwordResetExpiresInMs: parseDurationToMs(process.env.PASSWORD_RESET_EXPIRES_IN, 60 * 60 * 1000),
    emailVerificationExpiresInMs: parseDurationToMs(process.env.EMAIL_VERIFICATION_EXPIRES_IN, 24 * 60 * 60 * 1000),
    // Optional -- if SMTP_HOST is unset, src/utils/email.js falls back to
    // logging the email content instead of sending it, so local dev works
    // without a mail provider configured.
    smtp: {
        host: process.env.SMTP_HOST || null,
        port: Number(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER || null,
        pass: process.env.SMTP_PASS || null,
        from: process.env.EMAIL_FROM || "no-reply@example.com"
    }
}

module.exports = config
