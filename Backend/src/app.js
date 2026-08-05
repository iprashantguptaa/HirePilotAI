const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const helmet = require("helmet")
const compression = require("compression")
const morgan = require("morgan")
const rateLimit = require("express-rate-limit")

const config = require("./config/env")
const logger = require("./utils/logger")
const notFoundHandler = require("./middlewares/notFound.middleware")
const errorHandler = require("./middlewares/error.middleware")

const app = express()

// Render/Vercel/most PaaS providers sit behind a reverse proxy -- this is
// required for rate-limiting and secure cookies to see the real client IP
// and protocol instead of the proxy's.
app.set("trust proxy", 1)

// Root health check - BEFORE all middleware for Railway/PaaS health checks
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok", message: "HirePilot AI API is running" })
})

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", uptime: process.uptime() })
})

app.use(helmet())
app.use(compression())
app.use(express.json({ limit: "50kb" }))
app.use(cookieParser())

// CORS configuration - CRITICAL for cross-origin cookie authentication.
// Frontend (Vercel) and backend (Render) are different origins. If the
// Vercel origin is missing from this list, the browser blocks the response
// and the UI shows "Can't reach the server" even though /api/health is fine.
const allowedOrigins = new Set([
    config.frontendUrl,
    ...config.frontendUrls,
    // Known production frontend — kept as a safety net so a missing/wrong
    // FRONTEND_URL on Render does not take auth offline again.
    "https://hirepilot-frontend-mu.vercel.app",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
    "http://127.0.0.1:3000"
].filter(Boolean))

logger.info(`CORS allowlist: ${[ ...allowedOrigins ].join(", ")}`)

app.use(cors({
    origin: function (origin, callback) {
        // Allow non-browser clients (health checks, curl, server-to-server).
        if (!origin) return callback(null, true)

        if (allowedOrigins.has(origin)) {
            return callback(null, true)
        }

        // Never throw here — cors() turns thrown errors into opaque 500s that
        // the browser reports as "Network Error". Deny cleanly instead.
        logger.warn(`CORS blocked origin: ${origin}`)
        return callback(null, false)
    },
    credentials: true,
    methods: [ "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS" ],
    allowedHeaders: [ "Content-Type", "Authorization", "Cookie" ],
    exposedHeaders: [ "Set-Cookie" ]
}))
app.use(morgan(config.isProduction ? "combined" : "dev", { stream: logger.stream }))

// Applies to every route. Individual routers can layer stricter limits
// (e.g. login/register) on top of this baseline.
const globalRateLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    limit: config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." }
})
app.use("/api", globalRateLimiter)

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const chatRouter = require("./routes/chat.routes")
const sessionRouter = require("./routes/session.routes")
const profileRouter = require("./routes/profile.routes")
const adminRouter = require("./routes/admin.routes")
const feedbackRouter = require("./routes/feedback.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/chat", chatRouter)
app.use("/api/session", sessionRouter)
app.use("/api/profile", profileRouter)
app.use("/api/admin", adminRouter)
app.use("/api/feedback", feedbackRouter)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
