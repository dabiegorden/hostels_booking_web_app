// controllers/studentController.js
const Student = require('../models/Students');

exports.register = async (req, res) => {
  try {
    const {
      name, email, studentId, phoneNumber, program, level, department, password
    } = req.body;
    
    // Check if email already exists
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Check if student ID already exists
    const existingStudentId = await Student.findOne({ studentId });
    if (existingStudentId) {
      return res.status(400).json({ message: 'Student ID already registered' });
    }
    
    // Create student
    const student = new Student({
      name,
      email,
      studentId,
      phoneNumber,
      program,
      level,
      department,
      password
    });
    
    await student.save();
    
    // Set session after registration
    req.session.userId = student._id;
    req.session.userRole = 'student';
    
    return res.status(201).json({
      message: 'Student registration successful',
      studentId: student._id
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.session.userId).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    return res.status(200).json({ student });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};