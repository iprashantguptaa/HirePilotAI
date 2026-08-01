const crypto = require("node:crypto")

/**
 * Generates a random, URL-safe opaque token (e.g. for refresh tokens,
 * password resets, email verification links) and its SHA-256 hash.
 *
 * The raw token is what gets emailed/cookied to the user; only the hash
 * is ever stored in the database, so a database leak alone can't be used
 * to impersonate a user or reset their password.
 */
function generateOpaqueToken(bytes = 32) {
    const rawToken = crypto.randomBytes(bytes).toString("hex")
    return { rawToken, tokenHash: hashToken(rawToken) }
}

function hashToken(rawToken) {
    return crypto.createHash("sha256").update(rawToken).digest("hex")
}

module.exports = { generateOpaqueToken, hashToken }
