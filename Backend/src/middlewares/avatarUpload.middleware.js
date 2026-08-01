const multer = require("multer")
const ApiError = require("../utils/ApiError")

const ALLOWED_MIME_TYPES = [ "image/png", "image/jpeg", "image/webp" ]

const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1 * 1024 * 1024 // 1MB -- kept small since avatars are stored as base64 in MongoDB
    },
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            return cb(ApiError.badRequest("Avatar must be a PNG, JPEG, or WEBP image."))
        }
        cb(null, true)
    }
})

module.exports = avatarUpload
