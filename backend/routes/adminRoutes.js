const express = require('express');
const adminController = require('../controllers/adminController');
const { isAuthenticated, isAdmin } = require('../middleware/middleware');
const authController = require("../controllers/authController")

const router = express.Router();

// All routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

router.get('/students', adminController.getAllStudents);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id', adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// New route to get admin info
router.get('/info', isAuthenticated, isAdmin, authController.getAdminInfo);

module.exports = router;