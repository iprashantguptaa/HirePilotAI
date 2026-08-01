/**
 * Bootstraps an admin account. There is no in-app way to grant the
 * first admin role -- that's intentional, since an API endpoint that
 * could self-escalate a regular account to admin would be a serious
 * security hole. Run this from the server instead:
 *
 *   node scripts/createAdmin.js --email admin@example.com --username admin --password "change-me-now"
 *
 * If a user with that email already exists, it's promoted to admin
 * (password left untouched). Otherwise a new admin account is created
 * with the given username/password.
 */

require("dotenv").config()

const bcrypt = require("bcryptjs")
const mongoose = require("mongoose")
const userModel = require("../src/models/user.model")

function parseArgs() {
    const args = {}
    const argv = process.argv.slice(2)
    for (let i = 0; i < argv.length; i += 2) {
        const key = argv[ i ].replace(/^--/, "")
        args[ key ] = argv[ i + 1 ]
    }
    return args
}

async function main() {
    const { email, username, password } = parseArgs()

    if (!email) {
        console.error("Usage: node scripts/createAdmin.js --email <email> [--username <username>] [--password <password>]")
        process.exit(1)
    }

    await mongoose.connect(process.env.MONGO_URI)

    let user = await userModel.findOne({ email })

    if (user) {
        user.role = "admin"
        user.isActive = true
        await user.save()
        console.log(`Promoted existing user "${user.username}" (${user.email}) to admin.`)
    } else {
        if (!username || !password) {
            console.error("No existing user with that email -- provide --username and --password to create a new admin account.")
            process.exit(1)
        }
        if (password.length < 8) {
            console.error("Password must be at least 8 characters.")
            process.exit(1)
        }

        const hash = await bcrypt.hash(password, 10)
        user = await userModel.create({ username, email, password: hash, role: "admin", isEmailVerified: true })
        console.log(`Created new admin account "${user.username}" (${user.email}).`)
    }

    await mongoose.disconnect()
}

main().catch((err) => {
    console.error("Failed to create/promote admin:", err.message)
    process.exit(1)
})
