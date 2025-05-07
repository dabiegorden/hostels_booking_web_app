const express = require("express")
const router = express.Router()
const reviewController = require("../controllers/reviewController")
const { isAuthenticated, isAdmin, isStudent } = require("../middleware/middleware")

// Admin routes
router.get("/admin/reviews", isAuthenticated, isAdmin, reviewController.getAllReviews)
router.put("/admin/reviews/:id/verify", isAuthenticated, isAdmin, reviewController.verifyReview)

// Student routes
router.post("/reviews", isAuthenticated, isStudent, reviewController.createReview)
router.put("/reviews/:id", isAuthenticated, isStudent, reviewController.updateReview)
router.delete("/reviews/:id", isAuthenticated, reviewController.deleteReview)
router.get("/students/:studentId/reviews", isAuthenticated, reviewController.getReviewsByStudent)

// Public routes
router.get("/hostels/:hostelId/reviews", reviewController.getReviewsByHostel)
router.get("/reviews/:id", reviewController.getReviewById)
router.post("/reviews/:id/report", isAuthenticated, reviewController.reportReview)

module.exports = router
