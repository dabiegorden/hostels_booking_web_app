const express = require("express")
const hostelOwnerController = require("../controllers/hostelOwnerController")
const { isAuthenticated, isHostelOwner } = require("../middleware/middleware")
const { uploadHostelImages } = require("../middleware/upload")

const router = express.Router()

// Profile management - requires authentication
router.get("/profile", isAuthenticated, isHostelOwner, hostelOwnerController.getProfile)
router.put("/profile", isAuthenticated, isHostelOwner, hostelOwnerController.updateProfile)

// Hostel management - requires authentication for write operations
router.get("/hostels", isAuthenticated, isHostelOwner, hostelOwnerController.getMyHostels)
router.post("/hostels", isAuthenticated, isHostelOwner, uploadHostelImages, hostelOwnerController.createHostel)
router.get("/hostels/:id", isAuthenticated, isHostelOwner, hostelOwnerController.getMyHostelById)
router.put("/hostels/:id", isAuthenticated, isHostelOwner, uploadHostelImages, hostelOwnerController.updateHostel)
router.delete("/hostels/:id", isAuthenticated, isHostelOwner, hostelOwnerController.deleteHostel)

// Hostel image management - requires authentication
router.post(
  "/hostels/:id/images",
  isAuthenticated,
  isHostelOwner,
  uploadHostelImages,
  hostelOwnerController.uploadHostelImages,
)
router.delete("/hostels/:id/images", isAuthenticated, isHostelOwner, hostelOwnerController.deleteHostelImage)

// Room management - requires authentication for write operations
router.get("/hostels/:hostelId/rooms", isAuthenticated, isHostelOwner, hostelOwnerController.getRooms)
router.post(
  "/hostels/:hostelId/rooms",
  isAuthenticated,
  isHostelOwner,
  uploadHostelImages,
  hostelOwnerController.createRoom,
)
router.get("/rooms/:roomId", isAuthenticated, isHostelOwner, hostelOwnerController.getRoomById)
router.put("/rooms/:roomId", isAuthenticated, isHostelOwner, uploadHostelImages, hostelOwnerController.updateRoom)
router.delete("/rooms/:roomId", isAuthenticated, isHostelOwner, hostelOwnerController.deleteRoom)

// Room image management - requires authentication
router.post(
  "/rooms/:roomId/images",
  isAuthenticated,
  isHostelOwner,
  uploadHostelImages,
  hostelOwnerController.uploadRoomImages,
)
router.delete("/rooms/:roomId/images", isAuthenticated, isHostelOwner, hostelOwnerController.deleteRoomImage)

// Booking management - requires authentication
router.get("/bookings", isAuthenticated, isHostelOwner, hostelOwnerController.getMyBookings)
router.get("/hostels/:hostelId/bookings", isAuthenticated, isHostelOwner, hostelOwnerController.getBookingsByHostel)
router.put("/bookings/:bookingId/status", isAuthenticated, isHostelOwner, hostelOwnerController.updateBookingStatus)

module.exports = router
