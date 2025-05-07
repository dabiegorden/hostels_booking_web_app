const express = require('express');
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/middleware');
const authController = require("../controllers/authController");

const router = express.Router();

// All routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

// Admin info
router.get('/info', authController.getAdminInfo);
router.get('/dashboard/stats', adminController.getDashboardStats);

// Student management
router.get('/students', adminController.getAllStudents);
router.post('/students', adminController.createStudent);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Hostel owner management
router.get('/hostel-owners', adminController.getAllHostelOwners);
router.post('/hostel-owners', adminController.createHostelOwner);
router.get('/hostel-owners/:id', adminController.getHostelOwnerById);
router.put('/hostel-owners/:id', adminController.updateHostelOwner);
router.delete('/hostel-owners/:id', adminController.deleteHostelOwner);

// Hostel management
router.get('/hostels', adminController.getAllHostels);
router.post('/hostels', adminController.createHostel);
router.get('/hostels/:id', adminController.getHostelById);
router.put('/hostels/:id', adminController.updateHostel);
router.delete('/hostels/:id', adminController.deleteHostel);

module.exports = router;