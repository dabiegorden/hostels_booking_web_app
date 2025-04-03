const express = require('express');
const studentController = require('../controllers/studentController');
const { isAuthenticated, isStudent } = require('../middleware/middleware');

const router = express.Router();

// All routes require authentication and student role
router.use(isAuthenticated, isStudent);

router.get('/profile', studentController.getProfile);
router.put('/profile', studentController.updateProfile);

module.exports = router;