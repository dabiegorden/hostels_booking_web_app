const multer = require("multer")
const path = require("path")
const fs = require("fs")

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, "../uploads")
const hostelImagesDir = path.join(uploadDir, "hostels")

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

if (!fs.existsSync(hostelImagesDir)) {
  fs.mkdirSync(hostelImagesDir)
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, hostelImagesDir)
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, "hostel-" + uniqueSuffix + ext)
  },
})

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed!"), false)
  }
}

// Create the multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

module.exports = {
  uploadHostelImages: upload.array("images", 10), // Allow up to 10 images
}
