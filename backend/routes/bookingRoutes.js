const express = require("express")
const router = express.Router()
const bookingController = require("../controllers/bookingController")
const { isAuthenticated, isAdmin, isStudent, isHostelOwner } = require("../middleware/middleware")

// Admin routes
router.get("/admin/bookings", isAuthenticated, isAdmin, bookingController.getAllBookings)
router.get("/admin/bookings/stats", isAuthenticated, isAdmin, bookingController.getBookingStats)

// Student routes
router.post("/bookings", isAuthenticated, isStudent, bookingController.createBooking)
router.get("/students/:studentId/bookings", isAuthenticated, bookingController.getBookingsByStudent)

// Hostel owner routes
router.get("/hostels/:hostelId/bookings", isAuthenticated, bookingController.getBookingsByHostel)
router.put("/bookings/:id/status", isAuthenticated, bookingController.updateBookingStatus)

// Common routes
router.get("/bookings/:id", isAuthenticated, bookingController.getBookingById)

module.exports = router
