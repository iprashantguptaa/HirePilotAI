const nodemailer = require("nodemailer")
const config = require("../config/env")
const logger = require("./logger")

let transporter = null

function getTransporter() {
    if (transporter) return transporter

    if (!config.smtp.host) return null

    transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined
    })

    return transporter
}

/**
 * Sends a transactional email. If no SMTP provider is configured (common
 * in local development), this logs the content instead of throwing --
 * so password reset / verification flows stay testable without requiring
 * a mail provider, and never silently fail in a way that blocks the
 * request.
 */
async function sendEmail({ to, subject, html, text }) {
    const client = getTransporter()

    if (!client) {
        logger.warn(`SMTP not configured -- logging email instead of sending. To: ${to}, Subject: ${subject}`)
        logger.info(text || html)
        return { delivered: false, loggedOnly: true }
    }

    await client.sendMail({
        from: config.smtp.from,
        to,
        subject,
        html,
        text
    })

    return { delivered: true, loggedOnly: false }
}

module.exports = { sendEmail }
