const HostelOwner = require("../models/hostelOwnerSchema")
const Hostel = require("../models/Hostel")
const Room = require("../models/Room")
const Booking = require("../models/Booking")
const fs = require("fs")
const path = require("path")

// Get hostel owner profile
exports.getProfile = async (req, res) => {
  try {
    const hostelOwner = await HostelOwner.findById(req.session.user.id).select("-password")

    if (!hostelOwner) {
      return res.status(404).json({ message: "Hostel owner not found" })
    }

    res.status(200).json({ hostelOwner })
  } catch (error) {
    console.error("Get profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update hostel owner profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, businessName, businessAddress } = req.body

    const hostelOwner = await HostelOwner.findById(req.session.user.id)

    if (!hostelOwner) {
      return res.status(404).json({ message: "Hostel owner not found" })
    }

    // Update fields
    hostelOwner.name = name || hostelOwner.name
    hostelOwner.phoneNumber = phoneNumber || hostelOwner.phoneNumber
    hostelOwner.businessName = businessName || hostelOwner.businessName
    hostelOwner.businessAddress = businessAddress || hostelOwner.businessAddress

    await hostelOwner.save()

    res.status(200).json({
      message: "Profile updated successfully",
      hostelOwner: {
        name: hostelOwner.name,
        email: hostelOwner.email,
        phoneNumber: hostelOwner.phoneNumber,
        businessName: hostelOwner.businessName,
        businessAddress: hostelOwner.businessAddress,
      },
    })
  } catch (error) {
    console.error("Update profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// ==================== HOSTEL MANAGEMENT ====================
// Get all hostels (modified to allow public access)
exports.getMyHostels = async (req, res) => {
  try {
    // If user is authenticated, get hostels owned by the user
    // Otherwise, get all hostels
    let hostels
    if (req.session && req.session.user && req.session.user.id) {
      hostels = await Hostel.find({ owner: req.session.user.id })
    } else {
      hostels = await Hostel.find()
    }

    res.status(200).json({ hostels })
  } catch (error) {
    console.error("Get hostels error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get a specific hostel (modified to allow public access)
exports.getMyHostelById = async (req, res) => {
  try {
    // If user is authenticated, check ownership
    // Otherwise, just get the hostel by ID
    let hostel
    if (req.session && req.session.user && req.session.user.id) {
      hostel = await Hostel.findOne({
        _id: req.params.id,
        owner: req.session.user.id,
      })

      if (!hostel) {
        // If not found as owner, try to find it as a public hostel
        hostel = await Hostel.findById(req.params.id)
      }
    } else {
      hostel = await Hostel.findById(req.params.id)
    }

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" })
    }

    res.status(200).json({ hostel })
  } catch (error) {
    console.error("Get hostel error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new hostel
exports.createHostel = async (req, res) => {
  try {
    const { name, description, address, location, amenities, policies } = req.body

    // Create new hostel
    const hostel = new Hostel({
      name,
      description,
      address,
      location,
      owner: req.session.user.id,
      images: [], // Will be updated if images are uploaded
      amenities: amenities || [],
      policies: policies || "",
      verified: false, // Default to false, admin will verify
    })

    // If files were uploaded, add their paths to the hostel images array
    if (req.files && req.files.length > 0) {
      hostel.images = req.files.map((file) => `/uploads/hostels/${file.filename}`)
    }

    await hostel.save()

    res.status(201).json({
      message: "Hostel created successfully",
      hostel: {
        id: hostel._id,
        name: hostel.name,
        address: hostel.address,
        images: hostel.images,
      },
    })
  } catch (error) {
    console.error("Create hostel error:", error)
    res.status(500).json({ message: error.message || "Server error" })
  }
}

// Update a hostel
exports.updateHostel = async (req, res) => {
  try {
    const { name, description, address, location, amenities, policies } = req.body

    // Find hostel and verify ownership
    const hostel = await Hostel.findOne({
      _id: req.params.id,
      owner: req.session.user.id,
    })

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found or you do not have permission to update it" })
    }

    // Update fields
    if (name) hostel.name = name
    if (description) hostel.description = description
    if (address) hostel.address = address
    if (location) hostel.location = location
    if (amenities) hostel.amenities = amenities
    if (policies) hostel.policies = policies

    // If files were uploaded, add their paths to the hostel images array
    if (req.files && req.files.length > 0) {
      // Add new images to the existing array
      const newImages = req.files.map((file) => `/uploads/hostels/${file.filename}`)
      hostel.images = [...hostel.images, ...newImages]
    }

    await hostel.save()

    res.status(200).json({
      message: "Hostel updated successfully",
      hostel: {
        id: hostel._id,
        name: hostel.name,
        address: hostel.address,
        images: hostel.images,
      },
    })
  } catch (error) {
    console.error("Update hostel error:", error)
    res.status(500).json({ message: error.message || "Server error" })
  }
}

// Upload images for a hostel
exports.uploadHostelImages = async (req, res) => {
  try {
    // Find hostel and verify ownership
    const hostel = await Hostel.findOne({
      _id: req.params.id,
      owner: req.session.user.id,
    })

    if (!hostel) {
      // Delete uploaded files if hostel not found or not owned by user
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        })
      }
      return res.status(404).json({ message: "Hostel not found or you do not have permission to update it" })
    }

    // If files were uploaded, add their paths to the hostel images array
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/hostels/${file.filename}`)
      hostel.images = [...hostel.images, ...newImages]
      await hostel.save()
    } else {
      return res.status(400).json({ message: "No images uploaded" })
    }

    res.status(200).json({
      message: "Images uploaded successfully",
      images: req.files.map((file) => `/uploads/hostels/${file.filename}`),
      hostel: {
        id: hostel._id,
        name: hostel.name,
        images: hostel.images,
      },
    })
  } catch (error) {
    console.error("Upload hostel images error:", error)
    res.status(500).json({ message: error.message || "Server error" })
  }
}

// Delete hostel image
exports.deleteHostelImage = async (req, res) => {
  try {
    const { id: hostelId } = req.params
    const { imagePath } = req.body

    if (!imagePath) {
      return res.status(400).json({ message: "Image path is required" })
    }

    // Find hostel and verify ownership
    const hostel = await Hostel.findOne({
      _id: hostelId,
      owner: req.session.user.id,
    })

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found or you do not have permission to update it" })
    }

    // Check if image exists in hostel images
    if (!hostel.images.includes(imagePath)) {
      return res.status(404).json({ message: "Image not found for this hostel" })
    }

    // Remove image from hostel
    hostel.images = hostel.images.filter((img) => img !== imagePath)
    await hostel.save()

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", imagePath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.status(200).json({
      message: "Image deleted successfully",
      hostel: {
        id: hostel._id,
        name: hostel.name,
        images: hostel.images,
      },
    })
  } catch (error) {
    console.error("Delete hostel image error:", error)
    res.status(500).json({ message: error.message || "Server error" })
  }
}

// Delete a hostel
exports.deleteHostel = async (req, res) => {
  try {
    // Find hostel and verify ownership
    const hostel = await Hostel.findOne({
      _id: req.params.id,
      owner: req.session.user.id,
    })

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found or you do not have permission to delete it" })
    }

    // Delete hostel images from filesystem
    if (hostel.images && hostel.images.length > 0) {
      hostel.images.forEach((imagePath) => {
        const filePath = path.join(__dirname, "..", imagePath)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
    }

    // Delete the hostel
    await Hostel.findByIdAndDelete(req.params.id)

    // Delete all rooms associated with this hostel
    await Room.deleteMany({ hostelId: req.params.id })

    res.status(200).json({ message: "Hostel deleted successfully" })
  } catch (error) {
    console.error("Delete hostel error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// ==================== ROOM MANAGEMENT ====================
// Get all rooms for a specific hostel (modified to allow public access)
exports.getRooms = async (req, res) => {
  try {
    // Get rooms for the hostel without ownership verification
    const rooms = await Room.find({ hostelId: req.params.hostelId })
    res.status(200).json({ rooms })
  } catch (error) {
    console.error("Get rooms error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get a specific room (modified to allow public access)
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    res.status(200).json({ room })
  } catch (error) {
    console.error("Get room error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const { name, type, description, price, capacity, amenities, availability } = req.body

    // Validate room type
    const validTypes = ["1 in 1", "2 in 1", "3 in 1", "4 in 1", "other"]
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid room type. Must be one of: " + validTypes.join(", "),
      })
    }

    // Verify hostel ownership
    const hostel = await Hostel.findOne({
      _id: req.params.hostelId,
      owner: req.session.user.id,
    })

    if (!hostel) {
      // Delete uploaded files if hostel not found or not owned by user
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        })
      }
      return res.status(404).json({ message: "Hostel not found or you do not have permission to add rooms to it" })
    }

    // Create new room
    const room = new Room({
      hostelId: req.params.hostelId,
      name,
      type,
      description,
      price,
      capacity,
      amenities: amenities || [],
      images: [], // Will be updated if images are uploaded
      availability: availability !== undefined ? availability : true,
    })

    // If files were uploaded, add their paths to the room images array
    if (req.files && req.files.length > 0) {
      room.images = req.files.map((file) => `/uploads/hostels/${file.filename}`)
    }

    await room.save()

    res.status(201).json({
      message: "Room created successfully",
      room: {
        id: room._id,
        name: room.name,
        type: room.type,
        price: room.price,
        images: room.images,
      },
    })
  } catch (error) {
    console.error("Create room error:", error)
    res.status(500).json({ message: error.message || "Server error" })
  }
}

// Upload images for a room
exports.uploadRoomImages = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)

    if (!room) {
      // Delete uploaded files if room not found
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        })
      }
      return res.status(404).json({ message: "Room not found" })
    }

    // Verify hostel ownership
    const hostel = await Hostel.findOne({
      _id: room.hostelId,
      owner: req.session.user.id,
    })

    if (!hostel) {
      // Delete uploaded files if hostel not owned by user
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        })
      }
      return res.status(403).json({ message: "You do not have permission to update this room" })
    }

    // If files were uploaded, add their paths to the room images array
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/hostels/${file.filename}`)
      room.images = [...room.images, ...newImages]
      await room.save()
    } else {
      return res.status(400).json({ message: "No images uploaded" })
    }

    res.status(200).json({
      message: "Images uploaded successfully",
      images: req.files.map((file) => `/uploads/hostels/${file.filename}`),
      room: {
        id: room._id,
        name: room.name,
        images: room.images,
      },
    })
  } catch (error) {
    console.error("Upload room images error:", error)
    res.status(500).json({ message: error.message || "Server error" })
  }
}

// Update a room
exports.updateRoom = async (req, res) => {
  try {
    const { name, type, description, price, capacity, amenities, availability } = req.body

    // Validate room type if provided
    if (type) {
      const validTypes = ["1 in 1", "2 in 1", "3 in 1", "4 in 1", "other"]
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: "Invalid room type. Must be one of: " + validTypes.join(", "),
        })
      }
    }

    const room = await Room.findById(req.params.roomId)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Verify hostel ownership
    const hostel = await Hostel.findOne({
      _id: room.hostelId,
      owner: req.session.user.id,
    })

    if (!hostel) {
      return res.status(403).json({ message: "You do not have permission to update this room" })
    }

    // Update fields
    if (name) room.name = name
    if (type) room.type = type
    if (description) room.description = description
    if (price) room.price = price
    if (capacity) room.capacity = capacity
    if (amenities) room.amenities = amenities
    if (availability !== undefined) room.availability = availability

    // If files were uploaded, add their paths to the room images array
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => `/uploads/hostels/${file.filename}`)
      room.images = [...room.images, ...newImages]
    }

    await room.save()

    res.status(200).json({
      message: "Room updated successfully",
      room: {
        id: room._id,
        name: room.name,
        type: room.type,
        price: room.price,
        availability: room.availability,
        images: room.images,
      },
    })
  } catch (error) {
    console.error("Update room error:", error)
    res.status(500).json({ message: error.message || "Server error" })
  }
}

// Delete room image
exports.deleteRoomImage = async (req, res) => {
  try {
    const { roomId } = req.params
    const { imagePath } = req.body

    if (!imagePath) {
      return res.status(400).json({ message: "Image path is required" })
    }

    const room = await Room.findById(roomId)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Verify hostel ownership
    const hostel = await Hostel.findOne({
      _id: room.hostelId,
      owner: req.session.user.id,
    })

    if (!hostel) {
      return res.status(403).json({ message: "You do not have permission to update this room" })
    }

    // Check if image exists in room images
    if (!room.images.includes(imagePath)) {
      return res.status(404).json({ message: "Image not found for this room" })
    }

    // Remove image from room
    room.images = room.images.filter((img) => img !== imagePath)
    await room.save()

    // Delete file from filesystem
    const filePath = path.join(__dirname, "..", imagePath)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    res.status(200).json({
      message: "Image deleted successfully",
      room: {
        id: room._id,
        name: room.name,
        images: room.images,
      },
    })
  } catch (error) {
    console.error("Delete room image error:", error)
    res.status(500).json({ message: error.message || "Server error" })
  }
}

// Delete a room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    // Verify hostel ownership
    const hostel = await Hostel.findOne({
      _id: room.hostelId,
      owner: req.session.user.id,
    })

    if (!hostel) {
      return res.status(403).json({ message: "You do not have permission to delete this room" })
    }

    // Delete room images from filesystem
    if (room.images && room.images.length > 0) {
      room.images.forEach((imagePath) => {
        const filePath = path.join(__dirname, "..", imagePath)
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
        }
      })
    }

    await Room.findByIdAndDelete(req.params.roomId)

    res.status(200).json({ message: "Room deleted successfully" })
  } catch (error) {
    console.error("Delete room error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// ==================== BOOKING MANAGEMENT ====================
// Get all bookings for all hostels owned by the hostel owner
exports.getMyBookings = async (req, res) => {
  try {
    // Get all hostels owned by the user
    const hostels = await Hostel.find({ owner: req.session.user.id }).select("_id name")

    if (!hostels || hostels.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        bookings: [],
      })
    }

    // Get hostel IDs
    const hostelIds = hostels.map((hostel) => hostel._id)

    // Get all bookings for these hostels
    const bookings = await Booking.find({ hostel: { $in: hostelIds } })
      .populate("student", "name email studentId phoneNumber")
      .populate("hostel", "name address")
      .populate("room", "name type price capacity")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    })
  } catch (error) {
    console.error("Get my bookings error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get bookings for a specific hostel
exports.getBookingsByHostel = async (req, res) => {
  try {
    const { hostelId } = req.params

    // Verify hostel ownership
    const hostel = await Hostel.findOne({
      _id: hostelId,
      owner: req.session.user.id,
    })

    if (!hostel) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to view bookings for this hostel",
      })
    }

    // Get all bookings for this hostel
    const bookings = await Booking.find({ hostel: hostelId })
      .populate("student", "name email studentId phoneNumber")
      .populate("room", "name type price capacity")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    })
  } catch (error) {
    console.error("Get hostel bookings error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params
    const { bookingStatus } = req.body

    if (!["pending", "confirmed", "cancelled", "completed"].includes(bookingStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      })
    }

    // Get the booking
    const booking = await Booking.findById(bookingId).populate("hostel", "owner")

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      })
    }

    // Verify hostel ownership
    if (booking.hostel.owner.toString() !== req.session.user.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to update this booking",
      })
    }

    // Update booking status
    booking.bookingStatus = bookingStatus
    await booking.save()

    // If booking is cancelled, make room available again
    if (bookingStatus === "cancelled") {
      const room = await Room.findById(booking.room)
      if (room) {
        room.availability = true
        await room.save()
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    })
  } catch (error) {
    console.error("Update booking status error:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
