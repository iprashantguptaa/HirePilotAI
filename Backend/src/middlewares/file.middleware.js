const multer = require("multer")


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB
    },
    fileFilter(_req, file, cb) {
        const allowed = file.mimetype === "application/pdf"
            || (file.originalname || "").toLowerCase().endsWith(".pdf")
        if (!allowed) {
            cb(new Error("Resume must be a PDF."))
            return
        }
        cb(null, true)
    }
})


module.exports = upload