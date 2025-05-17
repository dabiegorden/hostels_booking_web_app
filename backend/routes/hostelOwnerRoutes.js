const express = require("express")
const hostelOwnerController = require("../controllers/hostelOwnerController")
const { isAuthenticated, isHostelOwner } = require("../middleware/middleware")
const { uploadHostelImages } = require("../middleware/upload")

const router = express.Router()

// All routes require authentication and hostel owner role
router.use(isAuthenticated, isHostelOwner)

// Profile management
router.get("/profile", hostelOwnerController.getProfile)
router.put("/profile", hostelOwnerController.updateProfile)

// Hostel management
router.get("/hostels", hostelOwnerController.getMyHostels)
router.post("/hostels", uploadHostelImages, hostelOwnerController.createHostel)
router.get("/hostels/:id", hostelOwnerController.getMyHostelById)
router.put("/hostels/:id", uploadHostelImages, hostelOwnerController.updateHostel)
router.delete("/hostels/:id", hostelOwnerController.deleteHostel)

// Hostel image management
router.post("/hostels/:id/images", uploadHostelImages, hostelOwnerController.uploadHostelImages)
router.delete("/hostels/:id/images", hostelOwnerController.deleteHostelImage)

// Room management
router.get("/hostels/:hostelId/rooms", hostelOwnerController.getRooms)
router.post("/hostels/:hostelId/rooms", uploadHostelImages, hostelOwnerController.createRoom)
router.get("/rooms/:roomId", hostelOwnerController.getRoomById)
router.put("/rooms/:roomId", uploadHostelImages, hostelOwnerController.updateRoom)
router.delete("/rooms/:roomId", hostelOwnerController.deleteRoom)

// Room image management
router.post("/rooms/:roomId/images", uploadHostelImages, hostelOwnerController.uploadRoomImages)
router.delete("/rooms/:roomId/images", hostelOwnerController.deleteRoomImage)

module.exports = router
