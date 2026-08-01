// Load .env file if it exists (development), Railway injects env vars directly in production
try {
    require("dotenv").config({ path: ".env" })
} catch (err) {
    // .env file doesn't exist in production, which is fine
    console.log("No .env file found, using environment variables from Railway")
}

// Loaded first and on purpose: this validates all required environment
// variables and throws immediately with a readable message if any are
// missing, instead of failing later with a confusing runtime error.
const config = require("./src/config/env")
const logger = require("./src/utils/logger")
const app = require("./src/app")
const connectToDB = require("./src/config/database")

let server

async function start() {
    await connectToDB()

    const host = '0.0.0.0'
    server = app.listen(config.port, host, () => {
        logger.info(`Server is running on ${host}:${config.port} [${config.nodeEnv}]`)
    })
}

start().catch((err) => {
    logger.error("Failed to start server", err)
    process.exit(1)
})

function shutdown(signal) {
    logger.info(`${signal} received, shutting down gracefully`)

    if (!server) {
        process.exit(0)
        return
    }

    server.close(() => {
        logger.info("HTTP server closed")
        process.exit(0)
    })

    // Force-exit if connections don't close in time.
    setTimeout(() => process.exit(1), 10_000).unref()
}

process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("SIGINT", () => shutdown("SIGINT"))

process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled promise rejection", reason)
})

process.on("uncaughtException", (err) => {
    logger.error("Uncaught exception", err)
    process.exit(1)
})
