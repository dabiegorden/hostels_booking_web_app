const mongoose = require("mongoose")

const SettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      default: "Hostel Booking System",
    },
    siteDescription: {
      type: String,
      default: "Find and book the best hostels",
    },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    logo: {
      type: String, // URL to logo image
    },
    favicon: {
      type: String, // URL to favicon
    },
    socialLinks: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
    paymentGateways: [
      {
        name: {
          type: String,
          required: true,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
        apiKey: {
          type: String,
        },
        secretKey: {
          type: String,
        },
      },
    ],
    bookingFee: {
      type: Number,
      default: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    termsAndConditions: {
      type: String,
    },
    privacyPolicy: {
      type: String,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Settings", SettingsSchema)
