const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
  hostelName: {
    type: String,
    required: true,
    trim: true
  },
  hostelDescription: {
    type: String,
    required: true
  },
  hostelAddress: {
    type: String,
    required: true
  },
  hostelLocation: {
    lat: String,
    lng: String
  },
  hostelImages: [{
    type: String // URLs to images
  }],
  amenities: {
    wifi: Boolean,
    waterSupply: Boolean,
    security: Boolean,
    studyRoom: Boolean,
    parking: Boolean,
    generator: Boolean
  },
  policies: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HostelOwner',
    required: true
  }
}, { timestamps: true });

const Hostel = mongoose.model('Hostel', hostelSchema);
module.exports = Hostel;