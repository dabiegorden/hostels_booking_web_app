const Admin = require('../models/Admin');
const Student = require('../models/Students');
const HostelOwner = require('../models/HostelOwner');
const Hostel = require('../models/Hostel');

exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin email already registered' });
    }
    
    // Create new admin
    const admin = new Admin({
      name,
      email,
      password
    });
    
    await admin.save();
    
    return res.status(201).json({
      message: 'Admin created successfully',
      adminId: admin._id
    });
    
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    return res.status(200).json({ students });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHostelOwners = async (req, res) => {
  try {
    const hostelOwners = await HostelOwner.find().select('-password');
    return res.status(200).json({ hostelOwners });
  } catch (error) {
    console.error('Get hostel owners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find().populate('owner', 'name email phoneNumber -_id');
    return res.status(200).json({ hostels });
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const hostelOwnerCount = await HostelOwner.countDocuments();
    const hostelCount = await Hostel.countDocuments();
    
    return res.status(200).json({
      stats: {
        studentCount,
        hostelOwnerCount,
        hostelCount
      }
    });
    
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};