const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const hostelOwnerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: true,
    match: /^\d{10}$/
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessAddress: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'hostel-owner'
  },
  verified: {
    type: Boolean,
    default: true  // Changed from false to true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

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

// Method to compare passwords
hostelOwnerSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const HostelOwner = mongoose.model('HostelOwner', hostelOwnerSchema);

module.exports = HostelOwner;