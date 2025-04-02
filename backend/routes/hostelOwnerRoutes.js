// routes/hostelOwnerRoutes.js
const express = require('express');
const router = express.Router();
const hostelOwnerController = require('../controllers/hostelOwnerController');
const { isAuthenticated, isHostelOwner } = require('../middleware/middleware');
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Handle hostel owner registration with file uploads
router.post(
  '/register',
  upload.fields([
    { name: 'profileImage', maxCount: 1 },
    { name: 'hostelImages', maxCount: 10 }
  ]),
  hostelOwnerController.register
);

// Protected routes
router.get('/profile', isAuthenticated, isHostelOwner, hostelOwnerController.getProfile);
router.get('/hostels', isAuthenticated, isHostelOwner, hostelOwnerController.getHostels);

module.exports = router;