const express = require("express");
const cors = require("cors");
const session = require("express-session");
const connectDB = require("./database/db");
const sessionConfig = require("./config/session");
const dotenv = require("dotenv");
dotenv.config();

// Import routes
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Session middleware
app.use(session(sessionConfig));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
app.listen(process.env.PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${process.env.PORT}`);
});
