const mongoose = require("mongoose")

const BookingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    hostel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    checkInDate: {
      type: Date,
      required: true,
    },
    checkOutDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: String, // Changed from Number to String
      enum: ["First Semester", "Second Semester", "Full Year"],
      default: "First Semester",
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Partial Payment", "Full Payment"],
      default: "Partial Payment",
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending", // Changed from "paid" to "pending" to match controller logic
    },
    specialRequests: {
      type: String,
    },
    customerInfo: {
      fullName: String,
      email: String,
      phone: String,
    },
    mobilePayment: {
      network: String,
      phoneNumber: String,
      transactionId: String,
    },
  },
  { timestamps: true },
)

module.exports = mongoose.model("Booking", BookingSchema)
