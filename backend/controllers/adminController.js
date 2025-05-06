const Admin = require('../models/Admin');
const Student = require('../models/Students');
const HostelOwner = require('../models/hostelOwnerSchema');
// Get all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().select('-password');
    res.status(200).json({ students });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json({ student });
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete student
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update student
exports.updateStudent = async (req, res) => {
  try {
    const { name, email, phoneNumber, program, level, department } = req.body;
    
    const student = await Student.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update fields
    student.name = name || student.name;
    student.email = email || student.email;
    student.phoneNumber = phoneNumber || student.phoneNumber;
    student.program = program || student.program;
    student.level = level || student.level;
    student.department = department || student.department;
    
    await student.save();
    
    res.status(200).json({
      message: 'Student updated successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        phoneNumber: student.phoneNumber,
        program: student.program,
        level: student.level,
        department: student.department
      }
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all hostel owners
exports.getAllHostelOwners = async (req, res) => {
  try {
    const hostelOwners = await HostelOwner.find().select('-password');
    res.status(200).json({ hostelOwners });
  } catch (error) {
    console.error('Get all hostel owners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get hostel owner by ID
// Get hostel owner by ID
exports.getHostelOwnerById = async (req, res) => {
  try {
    const hostelOwner = await HostelOwner.findById(req.params.id).select('-password');
    
    if (!hostelOwner) {
      return res.status(404).json({ message: 'Hostel owner not found' });
    }
    
    res.status(200).json({ hostelOwner });
  } catch (error) {
    console.error('Get hostel owner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete hostel owner
exports.deleteHostelOwner = async (req, res) => {
  try {
    const hostelOwner = await HostelOwner.findByIdAndDelete(req.params.id);
    
    if (!hostelOwner) {
      return res.status(404).json({ message: 'Hostel owner not found' });
    }
    
    res.status(200).json({ message: 'Hostel owner deleted successfully' });
  } catch (error) {
    console.error('Delete hostel owner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};