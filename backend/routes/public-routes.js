const express = require("express")
const router = express.Router()
const hostelController = require("../controllers/publicController")

// Public routes for hostels and rooms
router.get("/hostels", hostelController.getAllHostels)
router.get("/hostels/:id", hostelController.getHostelById)
router.get("/hostels/:hostelId/rooms", hostelController.getRoomsByHostel)
router.get("/rooms/:id", hostelController.getRoomById)
router.get("/hostels/:hostelId/reviews", hostelController.getHostelReviews)

module.exports = router
