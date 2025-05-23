const express = require("express")
const adminController = require("../controllers/adminController")
const { isAuthenticated, isAdmin } = require("../middleware/middleware")
const authController = require("../controllers/authController")
const { uploadHostelImages } = require("../middleware/upload")

const router = express.Router()

// All routes require authentication and admin role
router.use(isAuthenticated, isAdmin)

// Admin info
router.get("/info", authController.getAdminInfo)
router.get("/dashboard/stats", adminController.getDashboardStats)

// Student management
router.get("/students", adminController.getAllStudents)
router.post("/students", adminController.createStudent)
router.get("/students/:id", adminController.getStudentById)
router.put("/students/:id", adminController.updateStudent)
router.delete("/students/:id", adminController.deleteStudent)

// Hostel owner management
router.get("/hostel-owners", adminController.getAllHostelOwners)
router.post("/hostel-owners", adminController.createHostelOwner)
router.get("/hostel-owners/:id", adminController.getHostelOwnerById)
router.put("/hostel-owners/:id", adminController.updateHostelOwner)
router.delete("/hostel-owners/:id", adminController.deleteHostelOwner)

// Hostel management
router.get("/hostels", adminController.getAllHostels)
router.post("/hostels", uploadHostelImages, adminController.createHostel)
router.get("/hostels/:id", adminController.getHostelById)
router.put("/hostels/:id", uploadHostelImages, adminController.updateHostel)
router.delete("/hostels/:id", adminController.deleteHostel)

// Hostel image management
router.post("/hostels/:id/images", uploadHostelImages, adminController.uploadHostelImages)
router.delete("/hostels/:id/images", adminController.deleteHostelImage)

// Room management
router.get("/rooms", adminController.getAllRooms)
router.post("/rooms", uploadHostelImages, adminController.createRoom)
router.get("/rooms/:id", adminController.getRoomById)
router.put("/rooms/:id", uploadHostelImages, adminController.updateRoom)
router.delete("/rooms/:id", adminController.deleteRoom)

// Room image management
router.post("/rooms/:id/images", uploadHostelImages, adminController.uploadRoomImages)
router.delete("/rooms/:id/images", adminController.deleteRoomImage)

// Get rooms by hostel
router.get("/hostels/:hostelId/rooms", adminController.getRoomsByHostel)

module.exports = router