const express = require('express');
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/middleware');
const authController = require("../controllers/authController");

const router = express.Router();

// All routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

// Student management
router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Hostel owner management
router.get('/hostel-owners', adminController.getAllHostelOwners);
router.get('/hostel-owners/:id', adminController.getHostelOwnerById);
// Removed the verification endpoint: router.put('/hostel-owners/:id/verify', adminController.verifyHostelOwner);
router.delete('/hostel-owners/:id', adminController.deleteHostelOwner);

// Admin info
router.get('/info', authController.getAdminInfo);

module.exports = router;