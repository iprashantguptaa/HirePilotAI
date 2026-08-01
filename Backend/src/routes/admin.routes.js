const { Router } = require("express")
const adminController = require("../controllers/admin.controller")
const authMiddleware = require("../middlewares/auth.middleware")

const adminRouter = Router()

adminRouter.use(authMiddleware.authUser, authMiddleware.authorizeRoles("admin"))

adminRouter.get("/stats", adminController.getDashboardStatsController)

adminRouter.get("/users", adminController.listUsersController)
adminRouter.patch("/users/:userId", adminController.updateUserController)
adminRouter.delete("/users/:userId", adminController.deleteUserController)

adminRouter.get("/interviews", adminController.listInterviewsController)
adminRouter.delete("/interviews/:interviewId", adminController.deleteInterviewController)

adminRouter.get("/ai-usage", adminController.getAiUsageController)

adminRouter.get("/feature-flags", adminController.listFeatureFlagsController)
adminRouter.patch("/feature-flags/:key", adminController.upsertFeatureFlagController)

adminRouter.get("/feedback", adminController.listFeedbackController)
adminRouter.patch("/feedback/:feedbackId", adminController.updateFeedbackController)

adminRouter.get("/audit-log", adminController.listAuditLogController)

module.exports = adminRouter
