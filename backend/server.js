const express = require("express")
const cors = require("cors")
const session = require("express-session")
const connectDB = require("./database/db")
const sessionConfig = require("./config/session")
const dotenv = require("dotenv")
const path = require("path")
dotenv.config()

// Import routes
const authRoutes = require("./routes/authRoutes")
const studentRoutes = require("./routes/studentRoutes")
const adminRoutes = require("./routes/adminRoutes")
const hostelOwnerRoutes = require("./routes/hostelOwnerRoutes")
const paymentRoutes = require("./routes/paymentRoutes")
const bookingRoutes = require("./routes/bookingRoutes")
const reviewRoutes = require("./routes/reviewRoutes")
const settingsRoutes = require("./routes/settingsRoutes")
const publicRoutes = require("./routes/public-routes") // Add the new public routes

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
)

// Session middleware
app.use(session(sessionConfig))

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/students", studentRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/hostel-owners", hostelOwnerRoutes)
app.use("/api", paymentRoutes)
app.use("/api", bookingRoutes)
app.use("/api", reviewRoutes)
app.use("/api", settingsRoutes)
app.use("/api/public", publicRoutes) // Add the public routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Start server
app.listen(process.env.PORT, async () => {
  await connectDB()
  console.log(`Server running on port ${process.env.PORT}`)
})
