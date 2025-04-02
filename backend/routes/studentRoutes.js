// routes/studentRoutes.js
const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { isAuthenticated, isStudent } = require('../middleware/middleware');

router.post('/register', studentController.register);

// Protected routes
router.get('/profile', isAuthenticated, isStudent, studentController.getProfile);

module.exports = router;