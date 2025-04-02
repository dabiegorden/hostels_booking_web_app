// controllers/authController.js
const Admin = require('../models/Admin');
const Student = require('../models/Students');
const HostelOwner = require('../models/HostelOwner');

// Helper function to get model based on role
const getModelByRole = (role) => {
  switch (role) {
    case 'admin':
      return Admin;
    case 'student':
      return Student;
    case 'hostelOwner':
      return HostelOwner;
    default:
      return null;
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Please provide email, password and role' });
    }
    
    const Model = getModelByRole(role);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    // Find user by email
    const user = await Model.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set session data
    req.session.userId = user._id;
    req.session.userRole = role;
    
    // Send user data without password
    const userData = user.toObject();
    delete userData.password;
    
    return res.status(200).json({
      message: 'Login successful',
      user: userData
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    return res.status(200).json({ message: 'Logged out successfully' });
  });
};

exports.checkAuth = async (req, res) => {
  try {
    if (!req.session.userId || !req.session.userRole) {
      return res.status(401).json({ authenticated: false });
    }
    
    const Model = getModelByRole(req.session.userRole);
    if (!Model) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await Model.findById(req.session.userId);
    if (!user) {
      return res.status(401).json({ authenticated: false });
    }
    
    const userData = user.toObject();
    delete userData.password;
    
    return res.status(200).json({
      authenticated: true,
      user: userData,
      role: req.session.userRole
    });
    
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
