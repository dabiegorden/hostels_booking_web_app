// controllers/hostelOwnerController.js
const HostelOwner = require('../models/HostelOwner');
const Hostel = require('../models/Hostel');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Helper function to handle file upload
const saveFile = (file, folder) => {
  const uploadDir = path.join(__dirname, '..', 'public', 'uploads', folder);
  
  // Ensure directory exists
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  const filename = `${uuidv4()}-${file.originalname}`;
  const filepath = path.join(uploadDir, filename);
  
  // Save file
  fs.writeFileSync(filepath, file.buffer);
  
  // Return relative URL
  return `/uploads/${folder}/${filename}`;
};

exports.register = async (req, res) => {
  try {
    // Parse form data from multer
    const {
      name, email, password, phoneNumber, idType, idNumber,
      momoProvider, momoNumber, accountName,
      hostelName, hostelDescription, hostelAddress, hostelLocation,
      amenities, policies
    } = req.body;
    
    // Check if email already exists
    const existingOwner = await HostelOwner.findOne({ email });
    if (existingOwner) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Handle profile image
    let profileImageUrl = null;
    if (req.files && req.files.profileImage) {
      profileImageUrl = saveFile(req.files.profileImage[0], 'profiles');
    }
    
    // Create hostel owner
    const hostelOwner = new HostelOwner({
      name,
      email,
      password,
      phoneNumber,
      idType,
      idNumber,
      profileImage: profileImageUrl,
      momoProvider,
      momoNumber,
      accountName
    });
    
    await hostelOwner.save();
    
    // Handle hostel images
    let hostelImageUrls = [];
    if (req.files && req.files.hostelImages) {
      hostelImageUrls = req.files.hostelImages.map(file => 
        saveFile(file, 'hostels')
      );
    }
    
    // Parse JSON fields
    const parsedLocation = typeof hostelLocation === 'string' 
      ? JSON.parse(hostelLocation) 
      : hostelLocation;
      
    const parsedAmenities = typeof amenities === 'string' 
      ? JSON.parse(amenities) 
      : amenities;
    
    // Create hostel
    const hostel = new Hostel({
      hostelName,
      hostelDescription,
      hostelAddress,
      hostelLocation: parsedLocation,
      hostelImages: hostelImageUrls,
      amenities: parsedAmenities,
      policies,
      owner: hostelOwner._id
    });
    
    await hostel.save();
    
    // Update hostel owner with hostel reference
    hostelOwner.hostels.push(hostel._id);
    await hostelOwner.save();
    
    // Set session after registration
    req.session.userId = hostelOwner._id;
    req.session.userRole = 'hostelOwner';
    
    return res.status(201).json({
      message: 'Hostel owner registration successful',
      hostelOwnerId: hostelOwner._id
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const hostelOwner = await HostelOwner.findById(req.session.userId).select('-password');
    
    if (!hostelOwner) {
      return res.status(404).json({ message: 'Hostel owner not found' });
    }
    
    return res.status(200).json({ hostelOwner });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({ owner: req.session.userId });
    
    return res.status(200).json({ hostels });
    
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};