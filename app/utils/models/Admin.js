const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Password won't be included in query results by default
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super-admin'],
    required: true
  },
  permissions: {
    manageStudents: {
      type: Boolean,
      default: true
    },
    manageHostels: {
      type: Boolean,
      default: true
    },
    manageBookings: {
      type: Boolean,
      default: true
    },
    managePayments: {
      type: Boolean,
      default: true
    },
    manageOtherAdmins: {
      type: Boolean,
      default: false // Only super-admins can manage other admins by default
    }
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true
  }
});

// Pre-save middleware to hash password before saving
adminSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update the permissions based on role
adminSchema.pre('save', function(next) {
  if (this.isModified('role') && this.role === 'super-admin') {
    this.permissions.manageOtherAdmins = true;
  }
  next();
});

// Method to check if passwords match
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last login timestamp
adminSchema.methods.updateLoginTimestamp = function() {
  this.lastLogin = Date.now();
  return this.save({ validateBeforeSave: false });
};

// Check if admin has specific permission
adminSchema.methods.hasPermission = function(permission) {
  return this.permissions[permission] === true;
};

// Create and export the Admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;