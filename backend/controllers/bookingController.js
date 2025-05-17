const Booking = require("../models/Booking")
const Hostel = require("../models/Hostel")
const Room = require("../models/Room")
const Student = require("../models/Students")

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("student", "name email studentId")
      .populate("hostel", "name address")
      .populate("room", "roomNumber type price")

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("student", "name email studentId phoneNumber")
      .populate("hostel", "name address owner")
      .populate("room", "roomNumber type price")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user is authorized to view this booking
    if (
      req.session.user.role !== "admin" &&
      booking.student._id.toString() !== req.session.user._id.toString() &&
      booking.hostel.owner.toString() !== req.session.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      })
    }

    res.status(200).json({
      success: true,
      booking,
    })
  } catch (error) {
    console.error("Error fetching booking:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { hostelId, roomId, checkInDate, checkOutDate, duration, specialRequests } = req.body

    // Validate hostel and room exist
    const hostel = await Hostel.findById(hostelId)
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      })
    }

    const room = await Room.findById(roomId)
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    // Check if room belongs to the hostel
    if (room.hostel.toString() !== hostelId) {
      return res.status(400).json({
        success: false,
        message: "Room does not belong to the specified hostel",
      })
    }

    // Check if room is available
    if (!room.isAvailable) {
      return res.status(400).json({
        success: false,
        message: "Room is not available for booking",
      })
    }

    // Calculate total amount
    const totalAmount = room.price * duration

    // Create booking
    const booking = await Booking.create({
      student: req.session.user._id,
      hostel: hostelId,
      room: roomId,
      checkInDate,
      checkOutDate,
      duration,
      totalAmount,
      specialRequests,
      paymentStatus: "pending",
      bookingStatus: "pending",
    })

    // Update room availability
    room.isAvailable = false
    await room.save()

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update booking status (admin or hostel owner)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus } = req.body

    if (!["pending", "confirmed", "cancelled", "completed"].includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      })
    }

    const booking = await Booking.findById(req.params.id).populate("hostel", "owner")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Check if user is authorized to update this booking
    if (req.session.user.role !== "admin" && booking.hostel.owner.toString() !== req.session.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      })
    }

    booking.bookingStatus = bookingStatus
    await booking.save()

    // If booking is cancelled, make room available again
    if (bookingStatus === "cancelled") {
      const room = await Room.findById(booking.room)
      if (room) {
        room.isAvailable = true
        await room.save()
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    })
  } catch (error) {
    console.error("Error updating booking status:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get bookings by student ID
exports.getBookingsByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId

    // If not admin and not the student, deny access
    if (req.session.user.role !== "admin" && req.session.user._id.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these bookings",
      })
    }

    const bookings = await Booking.find({ student: studentId })
      .populate("hostel", "name address")
      .populate("room", "roomNumber type price")

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    })
  } catch (error) {
    console.error("Error fetching student bookings:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get bookings by hostel ID (for hostel owners)
// Fix for the getBookingsByHostel function
exports.getBookingsByHostel = async (req, res) => {
  try {
    const hostelId = req.params.hostelId

    // Debug session info
    // console.log("Booking request session:", {
    //   user: req.session.user
    //     ? {
    //         id: req.session.user.id,
    //         _id: req.session.user._id,
    //         role: req.session.user.role,
    //       }
    //     : null,
    // })

    // Verify hostel exists
    const hostel = await Hostel.findById(hostelId)

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      })
    }

    // Debug hostel owner info
    // console.log("Hostel owner:", hostel.owner)

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
        message: "Not authorized to view bookings for this hostel",
      })
    }

    const bookings = await Booking.find({ hostel: hostelId })
      .populate("room", "name type price")
      .populate("student", "name email studentId")

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    })
  } catch (error) {
    console.error("Error fetching hostel bookings:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}



// Get booking statistics (admin only)
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments()
    const pendingBookings = await Booking.countDocuments({ bookingStatus: "pending" })
    const confirmedBookings = await Booking.countDocuments({ bookingStatus: "confirmed" })
    const cancelledBookings = await Booking.countDocuments({ bookingStatus: "cancelled" })
    const completedBookings = await Booking.countDocuments({ bookingStatus: "completed" })

    // Calculate total booking value
    const bookingValues = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ])

    const totalValue = bookingValues.length > 0 ? bookingValues[0].total : 0

    // Get bookings by payment status
    const paymentStatus = await Booking.aggregate([{ $group: { _id: "$paymentStatus", count: { $sum: 1 } } }])

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        totalValue,
        paymentStatus,
      },
    })
  } catch (error) {
    console.error("Error fetching booking stats:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
