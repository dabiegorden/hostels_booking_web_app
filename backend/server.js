// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./database/db');
const sessionConfig = require('./config/session');

// Import routes
const authRoutes = require('./routes/authRoutes');
const hostelOwnerRoutes = require('./routes/hostelOwnerRoutes');
const studentRoutes = require('./routes/studentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize app
const app = express();



// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Setup session
sessionConfig(app);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hostel-owner', hostelOwnerRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
app.listen(process.env.PORT, async () => {
    await connectDB();
  console.log(`Server running on port ${process.env.PORT}`);
});