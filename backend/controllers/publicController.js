const Hostel = require("../models/Hostel")
const Room = require("../models/Room")
const Review = require("../models/Review")

// Get all hostels (public access)
exports.getAllHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find()
      .select("name description address images amenities rating reviews")
      .populate("owner", "businessName")

    res.status(200).json({
      success: true,
      count: hostels.length,
      hostels,
    })
  } catch (error) {
    console.error("Error fetching hostels:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get hostel by ID (public access)
exports.getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id)
      .select("name description address images amenities policies rating reviews verified")
      .populate("owner", "businessName")

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      })
    }

    res.status(200).json({
      success: true,
      hostel,
    })
  } catch (error) {
    console.error("Error fetching hostel:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get rooms by hostel ID (public access)
exports.getRoomsByHostel = async (req, res) => {
  try {
    console.log("Fetching rooms for hostel:", req.params.hostelId)

    // Make sure we're using the correct field to query rooms
    // If your Room model uses hostelId as a string, we need to match it exactly
    const rooms = await Room.find({ hostelId: req.params.hostelId }).select(
      "name type description price capacity amenities images availability",
    )

    console.log("Found rooms:", rooms.length)

    res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    })
  } catch (error) {
    console.error("Error fetching rooms:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get room by ID (public access)
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).select(
      "name type description price capacity amenities images availability hostelId",
    )

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      })
    }

    res.status(200).json({
      success: true,
      room,
    })
  } catch (error) {
    console.error("Error fetching room:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get hostel reviews (public access)
exports.getHostelReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ hostel: req.params.hostelId })
      .populate("student", "name")
      .select("rating title comment images createdAt isVerified helpfulVotes")
      .sort({ createdAt: -1 })

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
