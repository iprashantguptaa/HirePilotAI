const auditLogModel = require("../models/auditLog.model")
const logger = require("./logger")

async function recordAuditLog({ actorId, action, targetType, targetId, metadata }) {
    try {
        await auditLogModel.create({ actor: actorId, action, targetType, targetId, metadata })
    } catch (err) {
        logger.warn(`Failed to record audit log entry: ${err.message}`)
    }
}

module.exports = { recordAuditLog }
