require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const connectToDatabase = require('../database/db');


// Connect to database
connectToDatabase();

const createAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await Admin.findOne({ email: 'admin@gmail.com' });
    
    if (adminExists) {
      console.log('Admin already exists');
      process.exit(0);
    }
    
    // Create new admin
    const admin = new Admin({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: 'admin123!',
      role: 'admin'
    });
    
    await admin.save();
    console.log('Admin account created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();