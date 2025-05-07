const express = require('express');
const hostelOwnerController = require('../controllers/hostelOwnerController');
const { isAuthenticated, isHostelOwner } = require('../middleware/middleware');

const router = express.Router();

// All routes require authentication and hostel owner role
router.use(isAuthenticated, isHostelOwner);

// Profile management
router.get('/profile', hostelOwnerController.getProfile);
router.put('/profile', hostelOwnerController.updateProfile);

// Hostel management
router.get('/hostels', hostelOwnerController.getMyHostels);
router.post('/hostels', hostelOwnerController.createHostel);
router.get('/hostels/:id', hostelOwnerController.getMyHostelById);
router.put('/hostels/:id', hostelOwnerController.updateHostel);
router.delete('/hostels/:id', hostelOwnerController.deleteHostel);

// Room management
router.get('/hostels/:hostelId/rooms', hostelOwnerController.getRooms);
router.post('/hostels/:hostelId/rooms', hostelOwnerController.createRoom);
router.get('/rooms/:roomId', hostelOwnerController.getRoomById);
router.put('/rooms/:roomId', hostelOwnerController.updateRoom);
router.delete('/rooms/:roomId', hostelOwnerController.deleteRoom);

module.exports = router;