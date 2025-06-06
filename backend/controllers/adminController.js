const Admin = require("../models/Admin");
const Student = require("../models/Students");
const HostelOwner = require("../models/hostelOwnerSchema");
const Hostel = require("../models/Hostel");
const Room = require("../models/Room");
const fs = require("fs")
const path = require("path");

// ==================== ROOM MANAGEMENT (ADMIN) ====================
// Get all rooms
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("hostelId", "name address")
    res.status(200).json({ rooms })
  } catch (error) {
    console.error("Get all rooms error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get rooms by hostel ID
exports.getRoomsByHostel = async (req, res) => {
  try {
    const { hostelId } = req.params
    
    // Check if hostel exists
    const hostel = await Hostel.findById(hostelId)
    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" })
    }
    
    const rooms = await Room.find({ hostelId })
    res.status(200).json({ rooms })
  } catch (error) {
    console.error("Get rooms by hostel error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get room by ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("hostelId", "name address")

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
    }

    res.status(200).json({ room })
  } catch (error) {
    console.error("Get room error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create room
exports.createRoom = async (req, res) => {
  try {
    const { name, type, description, price, capacity, amenities, availability, hostelId } = req.body

    // Validate room type
    const validTypes = ["1 in 1", "2 in 1", "3 in 1", "4 in 1", "other"]
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid room type. Must be one of: " + validTypes.join(", "),
      })
    }

    // Check if hostel exists
    const hostel = await Hostel.findById(hostelId)
    if (!hostel) {
      // Delete uploaded files if hostel not found
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        })
      }
      return res.status(404).json({ message: "Hostel not found" })
    }

    // Create new room
    const room = new Room({
      hostelId,
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

// Update room
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

    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
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

// Upload images for a room
exports.uploadRoomImages = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)

    if (!room) {
      // Delete uploaded files if room not found
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        })
      }
      return res.status(404).json({ message: "Room not found" })
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

// Delete room image
exports.deleteRoomImage = async (req, res) => {
  try {
    const { id: roomId } = req.params
    const { imagePath } = req.body

    if (!imagePath) {
      return res.status(400).json({ message: "Image path is required" })
    }

    const room = await Room.findById(roomId)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
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

// Delete room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)

    if (!room) {
      return res.status(404).json({ message: "Room not found" })
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

    await Room.findByIdAndDelete(req.params.id)

    res.status(200).json({ message: "Room deleted successfully" })
  } catch (error) {
    console.error("Delete room error:", error)
    res.status(500).json({ message: "Server error" })
  }
};

// ==================== STUDENT MANAGEMENT ====================
// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select("-password")
    res.status(200).json({ students })
  } catch (error) {
    console.error("Get all students error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password")

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.status(200).json({ student })
  } catch (error) {
    console.error("Get student error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create student (admin can create student accounts)
exports.createStudent = async (req, res) => {
  try {
    const { name, email, studentId, phoneNumber, program, level, department, password } = req.body

    // Check if student already exists
    const existingStudent = await Student.findOne({
      $or: [{ email }, { studentId }],
    })

    if (existingStudent) {
      return res.status(400).json({
        message: existingStudent.email === email ? "Email already in use" : "Student ID already registered",
      })
    }

    // Create new student
    const student = new Student({
      name,
      email,
      studentId,
      phoneNumber,
      program,
      level,
      department,
      password,
      role: "student",
    })

    await student.save()

    res.status(201).json({
      message: "Student created successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        phoneNumber: student.phoneNumber,
        program: student.program,
        level: student.level,
        department: student.department,
      },
    })
  } catch (error) {
    console.error("Create student error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, phoneNumber, program, level, department } = req.body

    const student = await Student.findById(req.params.id)

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    // Update fields
    student.name = name || student.name
    student.email = email || student.email
    student.phoneNumber = phoneNumber || student.phoneNumber
    student.program = program || student.program
    student.level = level || student.level
    student.department = department || student.department

    await student.save()

    res.status(200).json({
      message: "Student updated successfully",
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        phoneNumber: student.phoneNumber,
        program: student.program,
        level: student.level,
        department: student.department,
      },
    })
  } catch (error) {
    console.error("Update student error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id)

    if (!student) {
      return res.status(404).json({ message: "Student not found" })
    }

    res.status(200).json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Delete student error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// ==================== HOSTEL OWNER MANAGEMENT ====================
// Get all hostel owners
exports.getAllHostelOwners = async (req, res) => {
  try {
    const hostelOwners = await HostelOwner.find().select("-password")
    res.status(200).json({ hostelOwners })
  } catch (error) {
    console.error("Get all hostel owners error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get hostel owner by ID
exports.getHostelOwnerById = async (req, res) => {
  try {
    const hostelOwner = await HostelOwner.findById(req.params.id).select("-password")

    if (!hostelOwner) {
      return res.status(404).json({ message: "Hostel owner not found" })
    }

    res.status(200).json({ hostelOwner })
  } catch (error) {
    console.error("Get hostel owner error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create hostel owner
exports.createHostelOwner = async (req, res) => {
  try {
    const { name, email, phoneNumber, businessName, businessAddress, password } = req.body

    // Check if hostel owner already exists
    const existingOwner = await HostelOwner.findOne({ email })

    if (existingOwner) {
      return res.status(400).json({
        message: "Email already in use",
      })
    }

    // Create new hostel owner
    const hostelOwner = new HostelOwner({
      name,
      email,
      phoneNumber,
      businessName,
      businessAddress,
      password,
      role: "hostel-owner",
      verified: true,
    })

    await hostelOwner.save()

    res.status(201).json({
      message: "Hostel owner created successfully",
      hostelOwner: {
        id: hostelOwner._id,
        name: hostelOwner.name,
        email: hostelOwner.email,
        phoneNumber: hostelOwner.phoneNumber,
        businessName: hostelOwner.businessName,
        businessAddress: hostelOwner.businessAddress,
      },
    })
  } catch (error) {
    console.error("Create hostel owner error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Update hostel owner
exports.updateHostelOwner = async (req, res) => {
  try {
    const { name, email, phoneNumber, businessName, businessAddress } = req.body

    const hostelOwner = await HostelOwner.findById(req.params.id)

    if (!hostelOwner) {
      return res.status(404).json({ message: "Hostel owner not found" })
    }

    // Update fields
    hostelOwner.name = name || hostelOwner.name
    hostelOwner.email = email || hostelOwner.email
    hostelOwner.phoneNumber = phoneNumber || hostelOwner.phoneNumber
    hostelOwner.businessName = businessName || hostelOwner.businessName
    hostelOwner.businessAddress = businessAddress || hostelOwner.businessAddress

    await hostelOwner.save()

    res.status(200).json({
      message: "Hostel owner updated successfully",
      hostelOwner: {
        id: hostelOwner._id,
        name: hostelOwner.name,
        email: hostelOwner.email,
        phoneNumber: hostelOwner.phoneNumber,
        businessName: hostelOwner.businessName,
        businessAddress: hostelOwner.businessAddress,
      },
    })
  } catch (error) {
    console.error("Update hostel owner error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete hostel owner
exports.deleteHostelOwner = async (req, res) => {
  try {
    const hostelOwner = await HostelOwner.findByIdAndDelete(req.params.id)

    if (!hostelOwner) {
      return res.status(404).json({ message: "Hostel owner not found" })
    }

    // Also delete all hostels owned by this owner
    const hostels = await Hostel.find({ owner: req.params.id })

    // Delete hostel images from filesystem
    for (const hostel of hostels) {
      if (hostel.images && hostel.images.length > 0) {
        hostel.images.forEach((imagePath) => {
          const filePath = path.join(__dirname, "..", imagePath)
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath)
          }
        })
      }
    }

    await Hostel.deleteMany({ owner: req.params.id })

    res.status(200).json({ message: "Hostel owner and associated hostels deleted successfully" })
  } catch (error) {
    console.error("Delete hostel owner error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// ==================== HOSTEL MANAGEMENT (ADMIN) ====================
// Get all hostels
exports.getAllHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find().populate("owner", "name businessName")
    res.status(200).json({ hostels })
  } catch (error) {
    console.error("Get all hostels error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Get hostel by ID
exports.getHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id).populate("owner", "name businessName")

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" })
    }

    res.status(200).json({ hostel })
  } catch (error) {
    console.error("Get hostel error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Create hostel (admin can create hostels and owners simultaneously)
exports.createHostel = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      address, 
      location, 
      amenities, 
      policies,
      // Owner information from the form
      ownerName,
      ownerEmail,
      ownerPhone,
      ownerBusinessName,
      ownerBusinessAddress
    } = req.body

    let ownerId;

    // Check if we have owner information to create a new owner
    if (ownerName && ownerEmail && ownerPhone && ownerBusinessName) {
      // Check if hostel owner already exists with this email
      let existingOwner = await HostelOwner.findOne({ email: ownerEmail })
      
      if (existingOwner) {
        // Use existing owner
        ownerId = existingOwner._id
      } else {
        // Create new hostel owner
        const hostelOwner = new HostelOwner({
          name: ownerName,
          email: ownerEmail,
          phoneNumber: ownerPhone,
          businessName: ownerBusinessName,
          businessAddress: ownerBusinessAddress || "",
          password: "defaultPassword123", // You might want to generate a random password
          role: "hostel-owner",
          verified: true, // Admin-created owners are automatically verified
        })

        await hostelOwner.save()
        ownerId = hostelOwner._id
      }
    } else {
      // Delete uploaded files if owner information is missing
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        })
      }
      return res.status(400).json({ message: "Owner information is required" })
    }

    // Create new hostel
    const hostel = new Hostel({
      name,
      description,
      address,
      location,
      owner: ownerId,
      images: [], // Will be updated if images are uploaded
      amenities: amenities ? JSON.parse(amenities) : [],
      policies: policies || "",
      verified: true, // Admin-created hostels are automatically verified
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
        owner: ownerId,
        images: hostel.images,
      },
    })
  } catch (error) {
    console.error("Create hostel error:", error)
    
    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach((file) => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      })
    }
    
    res.status(500).json({ message: error.message || "Server error" })
  }
};


// Upload images for a hostel (admin)
exports.uploadHostelImages = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id)

    if (!hostel) {
      // Delete uploaded files if hostel not found
      if (req.files && req.files.length > 0) {
        req.files.forEach((file) => {
          fs.unlinkSync(file.path)
        })
      }
      return res.status(404).json({ message: "Hostel not found" })
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

// Update hostel
exports.updateHostel = async (req, res) => {
  try {
    const { name, description, address, location, amenities, policies, verified } = req.body

    const hostel = await Hostel.findById(req.params.id)

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" })
    }

    // Update fields
    hostel.name = name || hostel.name
    hostel.description = description || hostel.description
    hostel.address = address || hostel.address
    if (location) hostel.location = location
    if (amenities) hostel.amenities = amenities
    hostel.policies = policies || hostel.policies
    if (verified !== undefined) hostel.verified = verified

    // If files were uploaded, add their paths to the hostel images array
    if (req.files && req.files.length > 0) {
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
        verified: hostel.verified,
        images: hostel.images,
      },
    })
  } catch (error) {
    console.error("Update hostel error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Delete hostel image (admin)
exports.deleteHostelImage = async (req, res) => {
  try {
    const { id: hostelId } = req.params
    const { imagePath } = req.body

    if (!imagePath) {
      return res.status(400).json({ message: "Image path is required" })
    }

    const hostel = await Hostel.findById(hostelId)

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" })
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

// Delete hostel
exports.deleteHostel = async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id)

    if (!hostel) {
      return res.status(404).json({ message: "Hostel not found" })
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

    await Hostel.findByIdAndDelete(req.params.id)

    // Also delete all rooms associated with this hostel
    await Room.deleteMany({ hostelId: req.params.id })

    res.status(200).json({ message: "Hostel deleted successfully" })
  } catch (error) {
    console.error("Delete hostel error:", error)
    res.status(500).json({ message: "Server error" })
  }
}

// Admin dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments()
    const hostelOwnerCount = await HostelOwner.countDocuments()
    const hostelCount = await Hostel.countDocuments()

    res.status(200).json({
      stats: {
        students: studentCount,
        hostelOwners: hostelOwnerCount,
        hostels: hostelCount,
      },
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
}
