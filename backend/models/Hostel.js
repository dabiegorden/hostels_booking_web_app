const mongoose = require("mongoose")

const hostelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: {
      type: String,
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "HostelOwner",
    required: true,
  },
  images: {
    type: [String],
    default: [],
  },
  amenities: {
    type: [String],
    default: [],
  },
  policies: {
    type: String,
    default: "",
  },

  verified: {
    type: Boolean,
    default: false,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Create index for geospatial queries
hostelSchema.index({ location: "2dsphere" })

// Update the updatedAt field before saving
hostelSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

const Hostel = mongoose.model("Hostel", hostelSchema)

module.exports = Hostel
