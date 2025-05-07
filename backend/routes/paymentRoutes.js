const express = require("express")
const router = express.Router()
const paymentController = require("../controllers/paymentController")
const { isAuthenticated, isAdmin, isStudent, isHostelOwner } = require("../middleware/middleware")

// Admin routes
router.get("/admin/payments", isAuthenticated, isAdmin, paymentController.getAllPayments)
router.get("/admin/payments/stats", isAuthenticated, isAdmin, paymentController.getPaymentStats)
router.put("/admin/payments/:id/status", isAuthenticated, isAdmin, paymentController.updatePaymentStatus)

// Student routes
router.post("/payments", isAuthenticated, isStudent, paymentController.createPayment)
router.get("/students/:studentId/payments", isAuthenticated, paymentController.getPaymentsByStudent)

// Hostel owner routes
router.get("/hostels/:hostelId/payments", isAuthenticated, paymentController.getPaymentsByHostel)

// Common routes
router.get("/payments/:id", isAuthenticated, paymentController.getPaymentById)

module.exports = router
