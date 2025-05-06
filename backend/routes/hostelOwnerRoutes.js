const express = require('express');
const hostelOwnerController = require('../controllers/hostelOwnerController');
const { isAuthenticated, isHostelOwner } = require('../middleware/middleware');

const router = express.Router();

// All routes require authentication and hostel owner role
router.use(isAuthenticated, isHostelOwner);

router.get('/profile', hostelOwnerController.getProfile);
router.put('/profile', hostelOwnerController.updateProfile);

module.exports = router;