const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const {
  isAuthenticated,
  isAdmin,
  isStudent,
  isHostelOwner,
} = require("../middleware/middleware");

// Public routes for creating bookings and handling payments
router.post(
  "/bookings/initialize-payment",
  bookingController.initializePayment
);
router.post(
  "/bookings/create-checkout-session",
  bookingController.createStripeCheckoutSession
);
router.post("/bookings/mobile-payment", bookingController.processMobilePayment);
router.get("/bookings/stripe-success", bookingController.handleStripeSuccess);
router.get(
  "/bookings/recent",
  isAuthenticated,
  bookingController.getRecentBooking
);
router.get(
  "/bookings/:id/report",
  isAuthenticated,
  bookingController.generateBookingReport
);

// Paystack specific routes
router.get("/payments/verify/:reference", bookingController.verifyPayment);
router.post("/payments/webhook", bookingController.handlePaystackWebhook);

// Add these new routes for payment completion
router.post(
  "/bookings/complete-checkout-session",
  isAuthenticated,
  bookingController.completeStripePayment
);
router.post(
  "/bookings/complete-mobile-payment",
  isAuthenticated,
  bookingController.completeMobilePayment
);
router.get(
  "/bookings/stripe-completion-success",
  isAuthenticated,
  bookingController.handleStripeCompletionSuccess
);

// Add this new route for current user's bookings
router.get(
  "/bookings/current-user",
  isAuthenticated,
  bookingController.getCurrentUserBookings
);

// Admin routes
router.get(
  "/admin/bookings",
  isAuthenticated,
  isAdmin,
  bookingController.getAllBookings
);
router.get(
  "/admin/booking-stats",
  isAuthenticated,
  isAdmin,
  bookingController.getBookingStats
);

// Student routes
router.get(
  "/students/:studentId/bookings",
  isAuthenticated,
  bookingController.getBookingsByStudent
);

// Hostel owner routes
router.get(
  "/hostels/:hostelId/bookings",
  isAuthenticated,
  bookingController.getBookingsByHostel
);

// Shared routes
router.get("/bookings/:id", isAuthenticated, bookingController.getBookingById);
router.put(
  "/bookings/:id/status",
  isAuthenticated,
  bookingController.updateBookingStatus
);

module.exports = router;
