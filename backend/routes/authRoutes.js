const express = require('express');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/middleware');

const router = express.Router();

// Student routes
router.post('/signup', authController.registerStudent);
router.post('/login', authController.loginStudent);
// router.post('/signin', authController.loginStudent);

// Admin routes
router.post('/admin/login', authController.loginAdmin);

// Common routes
router.post('/logout', authController.logout);
router.get('/me', isAuthenticated, authController.getCurrentUser);

module.exports = router;