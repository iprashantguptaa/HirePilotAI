const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 }

const currentLevel = LEVELS[ process.env.LOG_LEVEL ] ?? LEVELS.info

function timestamp() {
    return new Date().toISOString()
}

function log(level, message, meta) {
    if (LEVELS[ level ] > currentLevel) return

    const line = `[${timestamp()}] [${level.toUpperCase()}] ${message}`

    const payload = meta !== undefined ? [ line, meta ] : [ line ]

    if (level === "error") {
        console.error(...payload)
    } else if (level === "warn") {
        console.warn(...payload)
    } else {
        console.log(...payload)
    }
}

const logger = {
    error: (message, meta) => log("error", message, meta),
    warn: (message, meta) => log("warn", message, meta),
    info: (message, meta) => log("info", message, meta),
    debug: (message, meta) => log("debug", message, meta),
    // morgan writes HTTP access lines through this stream
    stream: {
        write: (message) => log("info", message.trim())
    }
}

module.exports = logger
