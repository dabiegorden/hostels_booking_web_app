const Review = require("../models/Review")
const Booking = require("../models/Booking")
const Hostel = require("../models/Hostel")

// Get all reviews (admin only)
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("student", "name email studentId")
      .populate("hostel", "name address")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    })
  } catch (error) {
    console.error("Error fetching reviews:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get review by ID
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("student", "name email studentId")
      .populate("hostel", "name address owner")

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    res.status(200).json({
      success: true,
      review,
    })
  } catch (error) {
    console.error("Error fetching review:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Create a new review
exports.createReview = async (req, res) => {
  try {
    const { hostelId, bookingId, rating, title, comment, images } = req.body

    // Validate hostel exists
    const hostel = await Hostel.findById(hostelId)
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      })
    }

    // Check if booking exists and belongs to the student
    if (bookingId) {
      const booking = await Booking.findById(bookingId)
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        })
      }

      if (booking.student.toString() !== req.session.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Not authorized to review this booking",
        })
      }

      if (booking.bookingStatus !== "completed") {
        return res.status(400).json({
          success: false,
          message: "Can only review completed bookings",
        })
      }
    }

    // Check if student has already reviewed this hostel
    const existingReview = await Review.findOne({
      student: req.session.user._id,
      hostel: hostelId,
    })

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this hostel",
      })
    }

    // Create review
    const review = await Review.create({
      student: req.session.user._id,
      hostel: hostelId,
      booking: bookingId,
      rating,
      title,
      comment,
      images: images || [],
    })

    // Update hostel rating
    const allReviews = await Review.find({ hostel: hostelId })
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / allReviews.length

    hostel.rating = averageRating
    hostel.reviewCount = allReviews.length
    await hostel.save()

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review,
    })
  } catch (error) {
    console.error("Error creating review:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update review (only by the review author)
exports.updateReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body

    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    // Check if user is authorized to update this review
    if (review.student.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      })
    }

    // Update review
    review.rating = rating || review.rating
    review.title = title || review.title
    review.comment = comment || review.comment
    review.images = images || review.images
    await review.save()

    // Update hostel rating
    const hostel = await Hostel.findById(review.hostel)
    const allReviews = await Review.find({ hostel: review.hostel })
    const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / allReviews.length

    hostel.rating = averageRating
    await hostel.save()

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    })
  } catch (error) {
    console.error("Error updating review:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Delete review (by author or admin)
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    // Check if user is authorized to delete this review
    if (req.session.user.role !== "admin" && review.student.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      })
    }

    await review.remove()

    // Update hostel rating
    const hostel = await Hostel.findById(review.hostel)
    const allReviews = await Review.find({ hostel: review.hostel })

    if (allReviews.length > 0) {
      const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0)
      const averageRating = totalRating / allReviews.length
      hostel.rating = averageRating
    } else {
      hostel.rating = 0
    }

    hostel.reviewCount = allReviews.length
    await hostel.save()

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting review:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get reviews by hostel ID
exports.getReviewsByHostel = async (req, res) => {
  try {
    const hostelId = req.params.hostelId

    const reviews = await Review.find({ hostel: hostelId }).populate("student", "name").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    })
  } catch (error) {
    console.error("Error fetching hostel reviews:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get reviews by student ID
exports.getReviewsByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId

    // If not admin and not the student, deny access
    if (req.session.user.role !== "admin" && req.session.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these reviews",
      })
    }

    const reviews = await Review.find({ student: studentId }).populate("hostel", "name address").sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    })
  } catch (error) {
    console.error("Error fetching student reviews:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Verify a review (admin only)
exports.verifyReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    review.isVerified = true
    await review.save()

    res.status(200).json({
      success: true,
      message: "Review verified successfully",
      review,
    })
  } catch (error) {
    console.error("Error verifying review:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Report a review
exports.reportReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      })
    }

    review.reportCount += 1
    await review.save()

    res.status(200).json({
      success: true,
      message: "Review reported successfully",
    })
  } catch (error) {
    console.error("Error reporting review:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
