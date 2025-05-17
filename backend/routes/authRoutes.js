const express = require('express');
const authController = require('../controllers/authController');
const { isAuthenticated } = require('../middleware/middleware');

const router = express.Router();

// Get session information
router.get("/session", (req, res) => {
  authController.getSessionInfo(req, res)
})

module.exports = router

// In your authRoutes.js
router.get("/session", (req, res) => {
  res.status(200).json({ 
    user: req.session.user || null,
    isAuthenticated: !!req.session.user
  });
});

// Student routes
router.post('/signup', authController.registerStudent);
router.post('/login', authController.loginStudent);

// Hostel Owner routes
router.post('/hostel-owner/signup', authController.registerHostelOwner);
router.post('/hostel-owner/login', authController.loginHostelOwner);

// Admin routes
router.post('/admin/login', authController.loginAdmin);

// Common routes
router.post('/logout', authController.logout);
router.get('/me', isAuthenticated, authController.getCurrentUser);

module.exports = router;