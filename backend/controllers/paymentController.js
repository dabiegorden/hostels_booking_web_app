const Payment = require("../models/Payment")
const Booking = require("../models/Booking")
const Student = require("../models/Students")
const Hostel = require("../models/Hostel")

// Get all payments (admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("booking", "bookingStatus duration totalAmount")
      .populate("student", "name email studentId")
      .populate("hostel", "name address")

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    })
  } catch (error) {
    console.error("Error fetching payments:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get payment by ID (admin or related student/hostel owner)
exports.getPaymentById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("booking", "bookingStatus duration totalAmount checkInDate checkOutDate")
      .populate("student", "name email studentId phoneNumber")
      .populate("hostel", "name address owner")

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    // Check if user is authorized to view this payment
    if (
      req.session.user.role !== "admin" &&
      payment.student._id.toString() !== req.session.user._id.toString() &&
      payment.hostel.owner.toString() !== req.session.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this payment",
      })
    }

    res.status(200).json({
      success: true,
      payment,
    })
  } catch (error) {
    console.error("Error fetching payment:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Create a new payment
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, paymentMethod, transactionId, amount } = req.body

    // Validate booking exists
    const booking = await Booking.findById(bookingId).populate("hostel", "owner")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user is authorized to make payment
    if (req.session.user.role !== "admin" && booking.student.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to make payment for this booking",
      })
    }

    // Create payment
    const payment = await Payment.create({
      booking: bookingId,
      student: booking.student,
      hostel: booking.hostel._id,
      amount,
      paymentMethod,
      transactionId,
      status: "completed",
      paymentDate: new Date(),
    })

    // Update booking payment status
    if (amount >= booking.totalAmount) {
      booking.paymentStatus = "paid"
    } else if (amount > 0) {
      booking.paymentStatus = "partial"
    }

    booking.bookingStatus = "confirmed"
    await booking.save()

    res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment,
    })
  } catch (error) {
    console.error("Error creating payment:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update payment status (admin only)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { status } = req.body

    if (!["pending", "completed", "failed", "refunded"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      })
    }

    const payment = await Payment.findById(req.params.id)

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      })
    }

    payment.status = status
    await payment.save()

    // If payment is refunded, update booking status
    if (status === "refunded") {
      const booking = await Booking.findById(payment.booking)
      if (booking) {
        booking.paymentStatus = "pending"
        booking.bookingStatus = "cancelled"
        await booking.save()
      }
    }

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      payment,
    })
  } catch (error) {
    console.error("Error updating payment status:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get payments by student ID
exports.getPaymentsByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId

    const payments = await Payment.find({ student: studentId })
      .populate("booking", "bookingStatus duration totalAmount")
      .populate("hostel", "name address")

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    })
  } catch (error) {
    console.error("Error fetching student payments:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}


// Fix for the getPaymentsByHostel function
exports.getPaymentsByHostel = async (req, res) => {
  try {
    const hostelId = req.params.hostelId

    // Verify hostel exists
    const hostel = await Hostel.findById(hostelId)

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      })
    }

    // More flexible authorization check
    const isAuthorized =
      req.session.user.role === "admin" ||
      (hostel.owner &&
        req.session.user &&
        ((req.session.user._id && hostel.owner.toString() === req.session.user._id.toString()) ||
          (req.session.user.id && hostel.owner.toString() === req.session.user.id.toString())))

    if (!isAuthorized) {
      console.log("Authorization failed:", {
        userRole: req.session.user.role,
        userId: req.session.user._id || req.session.user.id,
        hostelOwner: hostel.owner,
      })

      return res.status(403).json({
        success: false,
        message: "Not authorized to view payments for this hostel",
      })
    }

    const payments = await Payment.find({ hostel: hostelId })
      .populate("booking")
      .populate("student", "name email studentId")

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    })
  } catch (error) {
    console.error("Error fetching hostel payments:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}


// Get payment statistics (admin only)
exports.getPaymentStats = async (req, res) => {
  try {
    const totalPayments = await Payment.countDocuments()
    const completedPayments = await Payment.countDocuments({ status: "completed" })
    const pendingPayments = await Payment.countDocuments({ status: "pending" })
    const failedPayments = await Payment.countDocuments({ status: "failed" })

    // Calculate total amount received
    const paymentAmounts = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ])

    const totalAmount = paymentAmounts.length > 0 ? paymentAmounts[0].total : 0

    // Get payment methods distribution
    const paymentMethods = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 } } },
    ])

    res.status(200).json({
      success: true,
      stats: {
        totalPayments,
        completedPayments,
        pendingPayments,
        failedPayments,
        totalAmount,
        paymentMethods,
      },
    })
  } catch (error) {
    console.error("Error fetching payment stats:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
