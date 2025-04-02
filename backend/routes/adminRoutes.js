// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/middleware');

// Create first admin (this route should be protected in production)
router.post('/create', adminController.createAdmin);

// Protected routes
router.get('/students', isAuthenticated, isAdmin, adminController.getStudents);
router.get('/hostel-owners', isAuthenticated, isAdmin, adminController.getHostelOwners);
router.get('/hostels', isAuthenticated, isAdmin, adminController.getHostels);
router.get('/dashboard-stats', isAuthenticated, isAdmin, adminController.getDashboardStats);

module.exports = router;