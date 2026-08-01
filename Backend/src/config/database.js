const mongoose = require("mongoose")
const dns = require("node:dns")

const config = require("./env")
const logger = require("../utils/logger")

// Some networks fail to resolve MongoDB Atlas SRV records against the
// default resolver -- pinning to public DNS avoids that class of failure.
dns.setServers([ "8.8.8.8", "8.8.4.4" ])

async function connectToDB() {
    try {
        await mongoose.connect(config.mongoUri)
        logger.info("Connected to database")
    } catch (err) {
        // Rethrow so the caller (server.js) can decide to exit instead of
        // silently starting an HTTP server with no working database.
        logger.error("Database connection failed", err)
        throw err
    }
}

mongoose.connection.on("disconnected", () => {
    logger.warn("Database disconnected")
})

module.exports = connectToDB
