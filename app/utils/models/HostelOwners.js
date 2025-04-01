const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the schema for hostel owners
const hostelOwnerSchema = new mongoose.Schema({
  // Personal Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in query results by default
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  idType: {
    type: String,
    required: true,
    enum: ['nationalID', 'passport', 'driverLicense', 'voterID'],
    default: 'nationalID'
  },
  idNumber: {
    type: String,
    required: [true, 'ID number is required'],
    trim: true
  },
  profileImage: {
    type: String, // Store the URL to the uploaded image
    default: null
  },
  
  // Payment Information
  paymentInfo: {
    momoProvider: {
      type: String,
      required: true,
      enum: ['mtn', 'vodafone', 'airtel'],
      default: 'mtn'
    },
    momoNumber: {
      type: String,
      required: [true, 'Mobile money number is required'],
      trim: true
    },
    accountName: {
      type: String,
      required: [true, 'Account name is required'],
      trim: true
    }
  },
  
  // Hostel Information
  hostel: {
    hostelName: {
      type: String,
      required: [true, 'Hostel name is required'],
      trim: true
    },
    hostelDescription: {
      type: String,
      required: [true, 'Hostel description is required'],
      trim: true
    },
    hostelAddress: {
      type: String,
      required: [true, 'Hostel address is required'],
      trim: true
    },
    hostelLocation: {
      lat: { type: String, default: '' },
      lng: { type: String, default: '' }
    },
    hostelImages: [{
      type: String, // Store URLs to the uploaded images
      required: true
    }],
    amenities: {
      wifi: { type: Boolean, default: false },
      waterSupply: { type: Boolean, default: false },
      security: { type: Boolean, default: false },
      studyRoom: { type: Boolean, default: false },
      parking: { type: Boolean, default: false },
      generator: { type: Boolean, default: false }
    },
    policies: {
      type: String,
      default: ''
    }
  },
  
  // Account status
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save middleware to hash the password
hostelOwnerSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the timestamp when document is updated
hostelOwnerSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Method to check if entered password is correct
hostelOwnerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the model from the schema
const HostelOwner = mongoose.model('HostelOwner', hostelOwnerSchema);

module.exports = HostelOwner;