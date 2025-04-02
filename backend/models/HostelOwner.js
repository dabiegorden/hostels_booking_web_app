const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hostelOwnerSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  idType: {
    type: String,
    required: true,
    enum: ['nationalID', 'passport', 'driverLicense', 'voterID']
  },
  idNumber: {
    type: String,
    required: true
  },
  profileImage: {
    type: String, // URL to profile image
  },
  
  // Payment Information
  momoProvider: {
    type: String,
    required: true
  },
  momoNumber: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  
  role: {
    type: String,
    default: 'hostelOwner'
  },
  
  // Reference to hostels owned by this owner
  hostels: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hostel'
  }]
}, { timestamps: true });

// Hash password before saving
hostelOwnerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
hostelOwnerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const HostelOwner = mongoose.model('HostelOwner', hostelOwnerSchema);
module.exports = HostelOwner;