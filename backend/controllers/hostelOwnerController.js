const HostelOwner = require("../models/hostelOwnerSchema");

// Get hostel owner profile
exports.getProfile = async (req, res) => {
  try {
    const hostelOwner = await HostelOwner.findById(req.session.user.id).select('-password');
    
    if (!hostelOwner) {
      return res.status(404).json({ message: 'Hostel owner not found' });
    }
    
    res.status(200).json({ hostelOwner });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update hostel owner profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, businessName, businessAddress } = req.body;
    
    const hostelOwner = await HostelOwner.findById(req.session.user.id);
    
    if (!hostelOwner) {
      return res.status(404).json({ message: 'Hostel owner not found' });
    }
    
    // Update fields
    hostelOwner.name = name || hostelOwner.name;
    hostelOwner.phoneNumber = phoneNumber || hostelOwner.phoneNumber;
    hostelOwner.businessName = businessName || hostelOwner.businessName;
    hostelOwner.businessAddress = businessAddress || hostelOwner.businessAddress;
    
    await hostelOwner.save();
    
    res.status(200).json({
      message: 'Profile updated successfully',
      hostelOwner: {
        name: hostelOwner.name,
        email: hostelOwner.email,
        phoneNumber: hostelOwner.phoneNumber,
        businessName: hostelOwner.businessName,
        businessAddress: hostelOwner.businessAddress
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};