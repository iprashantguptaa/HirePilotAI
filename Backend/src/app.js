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

// CORS configuration - allow frontend and localhost
const allowedOrigins = [
    config.frontendUrl,
    "http://localhost:5173",
    "http://localhost:3000",
    "https://hirepilot-frontend-mu.vercel.app"
]

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(null, false)
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
const profileRouter = require("./routes/profile.routes")
const adminRouter = require("./routes/admin.routes")
const feedbackRouter = require("./routes/feedback.routes")


/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/chat", chatRouter)
app.use("/api/profile", profileRouter)
app.use("/api/admin", adminRouter)
app.use("/api/feedback", feedbackRouter)

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app
