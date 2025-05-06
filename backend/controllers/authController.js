const Student = require('../models/Students');
const Admin = require('../models/Admin');
const HostelOwner = require('../models/hostelOwnerSchema');

// Student Registration
exports.registerStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      studentId,
      phoneNumber,
      program,
      level,
      department,
      password,
      role
    } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { studentId }]
    });

    if (existingStudent) {
      return res.status(400).json({ 
        message: existingStudent.email === email 
          ? 'Email already in use' 
          : 'Student ID already registered' 
      });
    }

    // Create new student
    const student = new Student({
      name,
      email,
      studentId,
      phoneNumber,
      program,
      level,
      department,
      password,
      role: 'student'
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: 'Student registration successful'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration'
    });
  }
};

// Hostel Owner Registration
// Hostel Owner Registration
exports.registerHostelOwner = async (req, res) => {
  try {
    const {
      name,
      email,
      phoneNumber,
      businessName,
      businessAddress,
      password
    } = req.body;

    // Check if hostel owner already exists
    const existingOwner = await HostelOwner.findOne({ email });

    if (existingOwner) {
      return res.status(400).json({ 
        message: 'Email already in use'
      });
    }

    // Create new hostel owner
    const hostelOwner = new HostelOwner({
      name,
      email,
      phoneNumber,
      businessName,
      businessAddress,
      password,
      role: 'hostel-owner',
      verified: true  // Explicitly set to true
    });

    await hostelOwner.save();

    res.status(201).json({
      success: true,
      message: 'Hostel owner registration successful.'  // Removed verification message
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Server error during registration'
    });
  }
};

// Student Login
exports.loginStudent = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find student by email
    const student = await Student.findOne({ email });
    if (!student) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await student.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.user = {
      id: student._id,
      role: 'student',
      name: student.name,
      email: student.email,
      studentId: student.studentId
    };
    
    // Update cookie expiration if rememberMe is true
    if (rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
    }

    res.status(200).json({
      success: true,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
};

// Hostel Owner Login
exports.loginHostelOwner = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    // Find hostel owner by email
    const hostelOwner = await HostelOwner.findOne({ email });
    if (!hostelOwner) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await hostelOwner.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Set session
    req.session.user = {
      id: hostelOwner._id,
      role: 'hostel-owner',
      name: hostelOwner.name,
      email: hostelOwner.email,
      businessName: hostelOwner.businessName
    };
    
    // Update cookie expiration if rememberMe is true
    if (rememberMe) {
      req.session.cookie.maxAge = 1000 * 60 * 60 * 24 * 30; // 30 days
    }

    res.status(200).json({
      success: true,
      user: {
        id: hostelOwner._id,
        name: hostelOwner.name,
        email: hostelOwner.email,
        businessName: hostelOwner.businessName,
        role: 'hostel-owner'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Server error during login'
    });
  }
};

// Admin Login
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Verify password
    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Set session
    req.session.user = {
      id: admin._id,
      role: 'admin',
      name: admin.name,
      email: admin.email
    };

    res.status(200).json({
      success: true,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      message: 'Server error during admin login'
    });
  }
};

// Logout
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.status(200).json({ message: 'Logged out successfully' });
  });
};

// Get current user
exports.getCurrentUser = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.status(200).json({
    user: req.session.user
  });
};

// Get admin info
exports.getAdminInfo = async (req, res) => {
  try {
    const admin = await Admin.findById(req.session.user.id).select('-password');
    
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    
    res.status(200).json({ 
      success: true,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Get admin info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};