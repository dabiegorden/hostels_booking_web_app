const express = require("express")
const router = express.Router()
const settingsController = require("../controllers/settingsController")
const { isAuthenticated, isAdmin } = require("../middleware/middleware")

// Admin routes
router.put("/admin/settings", isAuthenticated, isAdmin, settingsController.updateSettings)
router.post("/admin/settings/payment-gateways", isAuthenticated, isAdmin, settingsController.addPaymentGateway)
router.put("/admin/settings/payment-gateways/:id", isAuthenticated, isAdmin, settingsController.updatePaymentGateway)
router.delete("/admin/settings/payment-gateways/:id", isAuthenticated, isAdmin, settingsController.deletePaymentGateway)

// Public routes
router.get("/settings", settingsController.getSettings)
router.get("/settings/terms", settingsController.getTermsAndConditions)
router.get("/settings/privacy", settingsController.getPrivacyPolicy)

module.exports = router
