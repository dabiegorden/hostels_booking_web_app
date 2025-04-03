const Student = require('../models/Students');

// Get student profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.session.user.id).select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.status(200).json({ student });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update student profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, program, level, department } = req.body;
    
    const student = await Student.findById(req.session.user.id);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Update fields
    student.name = name || student.name;
    student.phoneNumber = phoneNumber || student.phoneNumber;
    student.program = program || student.program;
    student.level = level || student.level;
    student.department = department || student.department;
    
    await student.save();
    
    res.status(200).json({
      message: 'Profile updated successfully',
      student: {
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
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};