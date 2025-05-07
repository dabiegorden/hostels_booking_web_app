const HostelOwner = require("../models/hostelOwnerSchema");
const Hostel = require("../models/Hostel"); // Assuming you have a Hostel model
const Room = require("../models/Room"); // Assuming you have a Room model

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

// ==================== HOSTEL MANAGEMENT ====================
// Get all hostels owned by the hostel owner
exports.getMyHostels = async (req, res) => {
  try {
    const hostels = await Hostel.find({ owner: req.session.user.id });
    res.status(200).json({ hostels });
  } catch (error) {
    console.error('Get hostels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific hostel owned by the hostel owner
exports.getMyHostelById = async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ 
      _id: req.params.id,
      owner: req.session.user.id
    });
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found or you do not have permission to view it' });
    }
    
    res.status(200).json({ hostel });
  } catch (error) {
    console.error('Get hostel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new hostel
exports.createHostel = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      location,
      images,
      amenities,
      policies
    } = req.body;

    // Create new hostel
    const hostel = new Hostel({
      name,
      description,
      address,
      location,
      owner: req.session.user.id,
      images,
      amenities,
      policies,
      verified: true // Auto-verified for simplicity
    });

    await hostel.save();

    res.status(201).json({
      message: 'Hostel created successfully',
      hostel: {
        id: hostel._id,
        name: hostel.name,
        address: hostel.address
      }
    });
  } catch (error) {
    console.error('Create hostel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a hostel
exports.updateHostel = async (req, res) => {
  try {
    const {
      name,
      description,
      address,
      location,
      images,
      amenities,
      policies
    } = req.body;
    
    // Find hostel and verify ownership
    const hostel = await Hostel.findOne({ 
      _id: req.params.id,
      owner: req.session.user.id
    });
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found or you do not have permission to update it' });
    }
    
    // Update fields
    hostel.name = name || hostel.name;
    hostel.description = description || hostel.description;
    hostel.address = address || hostel.address;
    if (location) hostel.location = location;
    if (images) hostel.images = images;
    if (amenities) hostel.amenities = amenities;
    hostel.policies = policies || hostel.policies;
    
    await hostel.save();
    
    res.status(200).json({
      message: 'Hostel updated successfully',
      hostel: {
        id: hostel._id,
        name: hostel.name,
        address: hostel.address
      }
    });
  } catch (error) {
    console.error('Update hostel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a hostel
exports.deleteHostel = async (req, res) => {
  try {
    // Find hostel and verify ownership
    const hostel = await Hostel.findOne({ 
      _id: req.params.id,
      owner: req.session.user.id
    });
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found or you do not have permission to delete it' });
    }
    
    // Delete the hostel
    await Hostel.findByIdAndDelete(req.params.id);
    
    // Delete all rooms associated with this hostel
    await Room.deleteMany({ hostelId: req.params.id });
    
    res.status(200).json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    console.error('Delete hostel error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// ==================== ROOM MANAGEMENT ====================
// Get all rooms for a specific hostel
exports.getRooms = async (req, res) => {
  try {
    // Verify hostel ownership
    const hostel = await Hostel.findOne({ 
      _id: req.params.hostelId,
      owner: req.session.user.id
    });
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found or you do not have permission to view it' });
    }
    
    const rooms = await Room.find({ hostelId: req.params.hostelId });
    res.status(200).json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a specific room
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Verify hostel ownership
    const hostel = await Hostel.findOne({ 
      _id: room.hostelId,
      owner: req.session.user.id
    });
    
    if (!hostel) {
      return res.status(403).json({ message: 'You do not have permission to view this room' });
    }
    
    res.status(200).json({ room });
  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new room
exports.createRoom = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      price,
      capacity,
      amenities,
      images,
      availability
    } = req.body;
    
    // Verify hostel ownership
    const hostel = await Hostel.findOne({ 
      _id: req.params.hostelId,
      owner: req.session.user.id
    });
    
    if (!hostel) {
      return res.status(404).json({ message: 'Hostel not found or you do not have permission to add rooms to it' });
    }
    
    // Create new room
    const room = new Room({
      hostelId: req.params.hostelId,
      name,
      type,
      description,
      price,
      capacity,
      amenities,
      images,
      availability: availability !== undefined ? availability : true
    });
    
    await room.save();
    
    res.status(201).json({
      message: 'Room created successfully',
      room: {
        id: room._id,
        name: room.name,
        type: room.type,
        price: room.price
      }
    });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update a room
exports.updateRoom = async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      price,
      capacity,
      amenities,
      images,
      availability
    } = req.body;
    
    const room = await Room.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Verify hostel ownership
    const hostel = await Hostel.findOne({ 
      _id: room.hostelId,
      owner: req.session.user.id
    });
    
    if (!hostel) {
      return res.status(403).json({ message: 'You do not have permission to update this room' });
    }
    
    // Update fields
    room.name = name || room.name;
    room.type = type || room.type;
    room.description = description || room.description;
    room.price = price || room.price;
    room.capacity = capacity || room.capacity;
    if (amenities) room.amenities = amenities;
    if (images) room.images = images;
    if (availability !== undefined) room.availability = availability;
    
    await room.save();
    
    res.status(200).json({
      message: 'Room updated successfully',
      room: {
        id: room._id,
        name: room.name,
        type: room.type,
        price: room.price,
        availability: room.availability
      }
    });
  } catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a room
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.roomId);
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    // Verify hostel ownership
    const hostel = await Hostel.findOne({ 
      _id: room.hostelId,
      owner: req.session.user.id
    });
    
    if (!hostel) {
      return res.status(403).json({ message: 'You do not have permission to delete this room' });
    }
    
    await Room.findByIdAndDelete(req.params.roomId);
    
    res.status(200).json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};