const Booking = require("../models/Booking");
const Hostel = require("../models/Hostel");
const Room = require("../models/Room");
const Student = require("../models/Students");
const https = require("https");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

// Helper function to make Paystack API requests
const makePaystackRequest = (options, data = null) => {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = "";

      res.on("data", (chunk) => {
        responseData += chunk;
      });

      res.on("end", () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

// Initialize payment transaction (new endpoint for Paystack Popup)
exports.initializePayment = async (req, res) => {
  try {
    const {
      hostelId,
      roomId,
      checkInDate,
      checkOutDate,
      duration,
      totalAmount,
      paymentAmount,
      paymentType,
      customerInfo,
      mobilePayment,
    } = req.body;

    // Validate hostel and room exist
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Create a pending booking
    const booking = await Booking.create({
      student: req.session?.user?._id || null, // If logged in
      hostel: hostelId,
      room: roomId,
      checkInDate,
      checkOutDate,
      duration,
      totalAmount,
      paymentStatus: paymentType, // Set to "Partial Payment" or "Full Payment"
      bookingStatus: "pending",
      customerInfo: req.session?.user?._id ? null : customerInfo, // Store customer info if not logged in
      mobilePayment: {
        network: mobilePayment.network,
        phoneNumber: mobilePayment.phoneNumber,
        transactionId: `INIT_${Date.now()}`, // Generate a placeholder transaction ID
      },
    });

    // Convert amount to kobo (Paystack expects amount in kobo)
    const amountInKobo = Math.round(paymentAmount * 100);

    // Generate unique reference
    const reference = `booking_${booking._id}_${Date.now()}`;

    // Prepare Paystack initialization data
    const paystackData = {
      email:
        customerInfo?.email || req.session?.user?.email || "customer@email.com",
      amount: amountInKobo,
      currency: "GHS", // Ghana Cedis
      reference: reference,
      callback_url: `${process.env.FRONTEND_URL}/bookings/success`,
      channels: ["mobile_money"], // Restrict to mobile money only
      metadata: {
        bookingId: booking._id.toString(),
        paymentType: paymentType,
        hostelName: hostel.name,
        roomName: room.name,
        duration: duration,
        network: mobilePayment.network,
        phoneNumber: mobilePayment.phoneNumber,
        customerInfo: JSON.stringify(customerInfo),
      },
    };

    // Paystack API options
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const paystackResponse = await makePaystackRequest(options, paystackData);

      if (!paystackResponse.status) {
        return res.status(400).json({
          success: false,
          message: paystackResponse.message || "Payment initialization failed",
        });
      }

      // Update booking with payment reference
      booking.paymentReference = reference;
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Payment initialized successfully",
        bookingId: booking._id,
        reference: reference,
        access_code: paystackResponse.data.access_code,
        authorization_url: paystackResponse.data.authorization_url,
      });
    } catch (error) {
      console.error("Paystack API error:", error);
      res.status(500).json({
        success: false,
        message: "Payment service error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error initializing payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Create a Paystack checkout session (replaces Stripe)
exports.createStripeCheckoutSession = async (req, res) => {
  try {
    const {
      hostelId,
      roomId,
      checkInDate,
      checkOutDate,
      duration,
      totalAmount,
      paymentAmount,
      paymentType,
      customerInfo,
      successUrl,
      cancelUrl,
    } = req.body;

    // Validate hostel and room exist
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Create a pending booking
    const booking = await Booking.create({
      student: req.session?.user?._id || null, // If logged in
      hostel: hostelId,
      room: roomId,
      checkInDate,
      checkOutDate,
      duration,
      totalAmount,
      paymentStatus: paymentType, // Set to "Partial Payment" or "Full Payment"
      bookingStatus: "pending",
      customerInfo: req.session?.user?._id ? null : customerInfo, // Store customer info if not logged in
    });

    // Convert amount to kobo (Paystack expects amount in kobo)
    const amountInKobo = Math.round(paymentAmount * 100);

    // Generate unique reference
    const reference = `booking_${booking._id}_${Date.now()}`;

    // Prepare Paystack initialization data
    const paystackData = {
      email:
        customerInfo?.email || req.session?.user?.email || "customer@email.com",
      amount: amountInKobo,
      currency: "GHS", // Ghana Cedis
      reference: reference,
      callback_url: successUrl,
      metadata: {
        bookingId: booking._id.toString(),
        paymentType: paymentType,
        hostelName: hostel.name,
        roomName: room.name,
        duration: duration,
        customerInfo: JSON.stringify(customerInfo),
      },
    };

    // Paystack API options
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const paystackResponse = await makePaystackRequest(options, paystackData);

      if (!paystackResponse.status) {
        return res.status(400).json({
          success: false,
          message: paystackResponse.message || "Payment initialization failed",
        });
      }

      // Update booking with payment reference
      booking.paymentReference = reference;
      await booking.save();

      res.status(200).json({
        success: true,
        url: paystackResponse.data.authorization_url,
        bookingId: booking._id,
        reference: reference,
        access_code: paystackResponse.data.access_code,
      });
    } catch (error) {
      console.error("Paystack API error:", error);
      res.status(500).json({
        success: false,
        message: "Payment service error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Process mobile money payment (updated for Paystack)
exports.processMobilePayment = async (req, res) => {
  try {
    const {
      hostelId,
      roomId,
      checkInDate,
      checkOutDate,
      duration,
      totalAmount,
      paymentAmount,
      paymentType,
      customerInfo,
      mobilePayment,
    } = req.body;

    // Validate hostel and room exist
    const hostel = await Hostel.findById(hostelId);
    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    // Create a pending booking
    const booking = await Booking.create({
      student: req.session?.user?._id || null, // If logged in
      hostel: hostelId,
      room: roomId,
      checkInDate,
      checkOutDate,
      duration,
      totalAmount,
      paymentStatus: paymentType, // Set to "Partial Payment" or "Full Payment"
      bookingStatus: "pending",
      customerInfo: req.session?.user?._id ? null : customerInfo, // Store customer info if not logged in
      mobilePayment: {
        network: mobilePayment.network,
        phoneNumber: mobilePayment.phoneNumber,
        transactionId: `MOMO_${Date.now()}`, // Generate a placeholder transaction ID
      },
    });

    // Convert amount to kobo
    const amountInKobo = Math.round(paymentAmount * 100);

    // Generate unique reference
    const reference = `momo_${booking._id}_${Date.now()}`;

    // Prepare Paystack mobile money data
    const paystackData = {
      email:
        customerInfo?.email || req.session?.user?.email || "customer@email.com",
      amount: amountInKobo,
      currency: "GHS",
      reference: reference,
      mobile_money: {
        phone: mobilePayment.phoneNumber,
        provider: mobilePayment.network.toLowerCase(), // mtn, vodafone, airteltigo
      },
      metadata: {
        bookingId: booking._id.toString(),
        paymentType: paymentType,
        duration: duration,
        network: mobilePayment.network,
      },
    };

    // Paystack mobile money API options
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/charge",
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const paystackResponse = await makePaystackRequest(options, paystackData);

      if (!paystackResponse.status) {
        return res.status(400).json({
          success: false,
          message: paystackResponse.message || "Mobile money payment failed",
        });
      }

      // Update booking with payment reference
      booking.paymentReference = reference;
      booking.mobilePayment.transactionId = reference;
      await booking.save();

      res.status(200).json({
        success: true,
        message: "Mobile money payment initiated successfully",
        bookingId: booking._id,
        reference: reference,
        status: paystackResponse.data.status,
        display_text: paystackResponse.data.display_text,
      });
    } catch (error) {
      console.error("Paystack mobile money error:", error);
      res.status(500).json({
        success: false,
        message: "Mobile money service error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error processing mobile money payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Handle Paystack success callback (replaces Stripe success)
exports.handleStripeSuccess = async (req, res) => {
  try {
    const { reference, trxref } = req.query;
    const paymentReference = reference || trxref;

    if (!paymentReference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required",
      });
    }

    // Verify transaction with Paystack
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${paymentReference}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const paystackResponse = await makePaystackRequest(options);

      if (!paystackResponse.status) {
        return res.status(400).json({
          success: false,
          message: paystackResponse.message || "Payment verification failed",
        });
      }

      const transactionData = paystackResponse.data;

      // Check if payment was successful
      if (transactionData.status !== "success") {
        return res.status(400).json({
          success: false,
          message: "Payment was not successful",
        });
      }

      // Find booking by reference
      const booking = await Booking.findOne({
        paymentReference: paymentReference,
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Update booking status
      booking.bookingStatus = "confirmed";
      booking.paymentVerified = true;
      booking.paystackTransactionId = transactionData.id;
      await booking.save();

      // Update room availability
      const room = await Room.findById(booking.room);
      if (room) {
        room.isAvailable = false;
        await room.save();
      }

      // Fetch full booking details with populated references
      const fullBooking = await Booking.findById(booking._id)
        .populate("hostel", "name address")
        .populate("room", "name type price")
        .populate("student", "name email");

      res.status(200).json({
        success: true,
        message: "Payment successful",
        booking: fullBooking,
        transaction: {
          reference: transactionData.reference,
          amount: transactionData.amount / 100, // Convert from kobo to cedis
          status: transactionData.status,
          paid_at: transactionData.paid_at,
          channel: transactionData.channel,
        },
      });
    } catch (error) {
      console.error("Paystack verification error:", error);
      res.status(500).json({
        success: false,
        message: "Payment verification service error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error handling payment success:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Verify payment endpoint (new)
exports.verifyPayment = async (req, res) => {
  try {
    const { reference } = req.params;

    if (!reference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required",
      });
    }

    // Verify transaction with Paystack
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${reference}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const paystackResponse = await makePaystackRequest(options);

      if (!paystackResponse.status) {
        return res.status(400).json({
          success: false,
          message: paystackResponse.message || "Payment verification failed",
        });
      }

      const transactionData = paystackResponse.data;

      res.status(200).json({
        success: true,
        data: {
          reference: transactionData.reference,
          amount: transactionData.amount / 100, // Convert from kobo to cedis
          status: transactionData.status,
          paid_at: transactionData.paid_at,
          channel: transactionData.channel,
          customer: transactionData.customer,
          metadata: transactionData.metadata,
        },
      });
    } catch (error) {
      console.error("Paystack verification error:", error);
      res.status(500).json({
        success: false,
        message: "Payment verification service error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Complete payment with Paystack for a partial payment booking (replaces Stripe completion)
exports.completeStripePayment = async (req, res) => {
  try {
    const { bookingId, paymentAmount, successUrl, cancelUrl } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId)
      .populate("hostel", "name")
      .populate("room", "name price images");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking is eligible for payment completion
    if (booking.paymentStatus !== "Partial Payment") {
      return res.status(400).json({
        success: false,
        message: "This booking is not eligible for payment completion",
      });
    }

    // Check if user is authorized to complete this payment
    const isAuthorized =
      req.session.user.role === "admin" ||
      (booking.student &&
        booking.student.toString() === req.session.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to complete this payment",
      });
    }

    // Convert amount to kobo
    const amountInKobo = Math.round(paymentAmount * 100);

    // Generate unique reference for completion payment
    const reference = `completion_${booking._id}_${Date.now()}`;

    // Prepare Paystack completion payment data
    const paystackData = {
      email:
        booking.customerInfo?.email ||
        req.session?.user?.email ||
        "customer@email.com",
      amount: amountInKobo,
      currency: "GHS",
      reference: reference,
      callback_url: successUrl,
      metadata: {
        bookingId: booking._id.toString(),
        isCompletionPayment: "true",
        originalReference: booking.paymentReference,
      },
    };

    // Paystack API options
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/transaction/initialize",
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const paystackResponse = await makePaystackRequest(options, paystackData);

      if (!paystackResponse.status) {
        return res.status(400).json({
          success: false,
          message:
            paystackResponse.message ||
            "Payment completion initialization failed",
        });
      }

      res.status(200).json({
        success: true,
        url: paystackResponse.data.authorization_url,
        reference: reference,
        access_code: paystackResponse.data.access_code,
      });
    } catch (error) {
      console.error("Paystack completion payment error:", error);
      res.status(500).json({
        success: false,
        message: "Payment completion service error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error creating completion payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Complete payment with mobile money for a partial payment booking
exports.completeMobilePayment = async (req, res) => {
  try {
    const { bookingId, paymentAmount, mobilePayment } = req.body;

    // Find the booking
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if booking is eligible for payment completion
    if (booking.paymentStatus !== "Partial Payment") {
      return res.status(400).json({
        success: false,
        message: "This booking is not eligible for payment completion",
      });
    }

    // Check if user is authorized to complete this payment
    const isAuthorized =
      req.session.user.role === "admin" ||
      (booking.student &&
        booking.student.toString() === req.session.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to complete this payment",
      });
    }

    // Convert amount to kobo
    const amountInKobo = Math.round(paymentAmount * 100);

    // Generate unique reference for completion payment
    const reference = `momo_completion_${booking._id}_${Date.now()}`;

    // Prepare Paystack mobile money completion data
    const paystackData = {
      email:
        booking.customerInfo?.email ||
        req.session?.user?.email ||
        "customer@email.com",
      amount: amountInKobo,
      currency: "GHS",
      reference: reference,
      mobile_money: {
        phone: mobilePayment.phoneNumber,
        provider: mobilePayment.network.toLowerCase(),
      },
      metadata: {
        bookingId: booking._id.toString(),
        isCompletionPayment: "true",
        originalReference: booking.paymentReference,
      },
    };

    // Paystack mobile money API options
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: "/charge",
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const paystackResponse = await makePaystackRequest(options, paystackData);

      if (!paystackResponse.status) {
        return res.status(400).json({
          success: false,
          message:
            paystackResponse.message ||
            "Mobile money completion payment failed",
        });
      }

      // If successful, update booking payment status
      if (paystackResponse.data.status === "success") {
        booking.paymentStatus = "Full Payment";
        await booking.save();
      }

      res.status(200).json({
        success: true,
        message: "Mobile money completion payment initiated successfully",
        reference: reference,
        status: paystackResponse.data.status,
        display_text: paystackResponse.data.display_text,
        booking: booking,
      });
    } catch (error) {
      console.error("Paystack mobile money completion error:", error);
      res.status(500).json({
        success: false,
        message: "Mobile money completion service error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error processing mobile money completion payment:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Handle Paystack success for completion payments (replaces Stripe completion success)
exports.handleStripeCompletionSuccess = async (req, res) => {
  try {
    const { reference, trxref } = req.query;
    const paymentReference = reference || trxref;

    if (!paymentReference) {
      return res.status(400).json({
        success: false,
        message: "Payment reference is required",
      });
    }

    // Verify transaction with Paystack
    const options = {
      hostname: "api.paystack.co",
      port: 443,
      path: `/transaction/verify/${paymentReference}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    };

    try {
      const paystackResponse = await makePaystackRequest(options);

      if (!paystackResponse.status) {
        return res.status(400).json({
          success: false,
          message: paystackResponse.message || "Payment verification failed",
        });
      }

      const transactionData = paystackResponse.data;

      // Check if this is a completion payment
      if (transactionData.metadata.isCompletionPayment !== "true") {
        return res.status(400).json({
          success: false,
          message: "This is not a completion payment transaction",
        });
      }

      // Check if payment was successful
      if (transactionData.status !== "success") {
        return res.status(400).json({
          success: false,
          message: "Payment completion was not successful",
        });
      }

      // Get the booking ID from metadata
      const bookingId = transactionData.metadata.bookingId;

      // Update the booking payment status
      const booking = await Booking.findById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: "Booking not found",
        });
      }

      // Update booking payment status to full payment
      booking.paymentStatus = "Full Payment";
      booking.completionPaymentReference = paymentReference;
      booking.completionPaymentVerified = true;
      await booking.save();

      // Fetch full booking details with populated references
      const fullBooking = await Booking.findById(bookingId)
        .populate("hostel", "name address")
        .populate("room", "name type price")
        .populate("student", "name email");

      res.status(200).json({
        success: true,
        message: "Payment completion successful",
        booking: fullBooking,
        transaction: {
          reference: transactionData.reference,
          amount: transactionData.amount / 100, // Convert from kobo to cedis
          status: transactionData.status,
          paid_at: transactionData.paid_at,
          channel: transactionData.channel,
        },
      });
    } catch (error) {
      console.error("Paystack completion verification error:", error);
      res.status(500).json({
        success: false,
        message: "Payment completion verification service error",
        error: error.message,
      });
    }
  } catch (error) {
    console.error("Error handling payment completion success:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Paystack webhook handler (new)
exports.handlePaystackWebhook = async (req, res) => {
  try {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha512", PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (hash !== req.headers["x-paystack-signature"]) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature",
      });
    }

    const event = req.body;

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        // Handle successful payment
        const successData = event.data;
        const successBooking = await Booking.findOne({
          paymentReference: successData.reference,
        });

        if (successBooking) {
          successBooking.bookingStatus = "confirmed";
          successBooking.paymentVerified = true;
          successBooking.paystackTransactionId = successData.id;
          await successBooking.save();

          // Update room availability
          const room = await Room.findById(successBooking.room);
          if (room) {
            room.isAvailable = false;
            await room.save();
          }
        }
        break;

      case "charge.failed":
        // Handle failed payment
        const failedData = event.data;
        const failedBooking = await Booking.findOne({
          paymentReference: failedData.reference,
        });

        if (failedBooking) {
          failedBooking.bookingStatus = "cancelled";
          failedBooking.paymentVerified = false;
          await failedBooking.save();
        }
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({
      success: false,
      message: "Webhook processing error",
      error: error.message,
    });
  }
};

// Keep all other existing functions unchanged
exports.getRecentBooking = async (req, res) => {
  try {
    if (!req.session?.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const booking = await Booking.findOne({ student: req.session.user._id })
      .sort({ createdAt: -1 })
      .populate("hostel", "name address")
      .populate("room", "name type price");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "No recent bookings found",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching recent booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Generate a PDF booking report
exports.generateBookingReport = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("hostel", "name address owner images")
      .populate("room", "name type price capacity images amenities")
      .populate("student", "name email studentId phoneNumber");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is authorized to view this booking
    const isAuthorized =
      req.session.user.role === "admin" ||
      (booking.student &&
        booking.student._id.toString() === req.session.user._id.toString()) ||
      (booking.hostel &&
        booking.hostel.owner &&
        booking.hostel.owner.toString() === req.session.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this booking",
      });
    }

    // Create a PDF document with better margins for design
    const doc = new PDFDocument({
      margin: 50,
      size: "A4",
    });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=booking-${booking._id}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Define colors
    const primaryColor = "#4F46E5"; // Indigo
    const secondaryColor = "#818CF8"; // Light indigo
    const accentColor = "#10B981"; // Green
    const textColor = "#1F2937"; // Dark gray
    const lightGray = "#F3F4F6"; // Light gray for backgrounds

    // Helper function to format currency
    const formatCurrency = (amount) => {
      return `GH₵ ${amount.toFixed(2)}`;
    };

    // Helper function to format date
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Add header with hostel name
    doc
      .fontSize(25)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text(booking.hostel.name, 50, 50, { align: "center" });

    doc
      .fontSize(12)
      .font("Helvetica")
      .fillColor(secondaryColor)
      .text("Your Home Away From Home", 50, 80, { align: "center" });

    // Add booking confirmation title with badge
    doc
      .roundedRect(doc.page.width / 2 - 100, 110, 200, 40, 10)
      .fillAndStroke(primaryColor, "white");

    doc
      .fillColor("white")
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("BOOKING CONFIRMATION", doc.page.width / 2 - 90, 122, {
        align: "center",
        width: 180,
      });

    // Add booking status badge
    const statusColors = {
      pending: "#FCD34D", // Yellow
      confirmed: "#10B981", // Green
      cancelled: "#EF4444", // Red
      completed: "#3B82F6", // Blue
    };

    const statusColor = statusColors[booking.bookingStatus] || "#9CA3AF";

    doc
      .roundedRect(doc.page.width - 150, 50, 100, 25, 10)
      .fillAndStroke(statusColor, "white");

    doc
      .fillColor("white")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(booking.bookingStatus.toUpperCase(), doc.page.width - 150, 57, {
        align: "center",
        width: 100,
      });

    // Add booking ID and date
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(textColor)
      .text(`Booking ID: ${booking._id}`, 50, 170);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor(textColor)
      .text(`Booking Date: ${formatDate(booking.createdAt)}`, 50, 185);

    // Add payment reference if available
    if (booking.paymentReference) {
      doc
        .font("Helvetica")
        .fontSize(10)
        .fillColor(textColor)
        .text(`Payment Reference: ${booking.paymentReference}`, 50, 200);
    }

    // Draw horizontal separator
    doc
      .strokeColor(lightGray)
      .lineWidth(1)
      .moveTo(50, 220)
      .lineTo(doc.page.width - 50, 220)
      .stroke();

    // Customer Information Section
    let yPos = 235;

    // Section title
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("CUSTOMER INFORMATION", 50, yPos);

    yPos += 25;

    // Draw section background
    doc
      .fillColor(lightGray)
      .roundedRect(50, yPos - 10, doc.page.width - 100, 100, 5)
      .fill();

    // Customer details - left column
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Name:", 70, yPos);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(
        booking.student
          ? booking.student.name
          : booking.customerInfo
          ? booking.customerInfo.fullName
          : "N/A",
        70,
        yPos + 15
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Email:", 70, yPos + 40);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(
        booking.student
          ? booking.student.email
          : booking.customerInfo
          ? booking.customerInfo.email
          : "N/A",
        70,
        yPos + 55
      );

    // Customer details - right column
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Student ID:", 300, yPos);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(
        booking.student && booking.student.studentId
          ? booking.student.studentId
          : "N/A",
        300,
        yPos + 15
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Phone:", 300, yPos + 40);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(
        booking.student && booking.student.phoneNumber
          ? booking.student.phoneNumber
          : booking.customerInfo
          ? booking.customerInfo.phone
          : "N/A",
        300,
        yPos + 55
      );

    // Accommodation Details Section
    yPos += 110;

    // Section title
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("ACCOMMODATION DETAILS", 50, yPos);

    yPos += 25;

    // Draw section background
    doc
      .fillColor(lightGray)
      .roundedRect(50, yPos - 10, doc.page.width - 100, 120, 5)
      .fill();

    // Accommodation details - left column
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Hostel:", 70, yPos);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(booking.hostel.name, 70, yPos + 15);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Address:", 70, yPos + 40);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(booking.hostel.address, 70, yPos + 55, { width: 200 });

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Capacity:", 70, yPos + 80);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(
        `${booking.room.capacity} ${
          booking.room.capacity > 1 ? "people" : "person"
        }`,
        70,
        yPos + 95
      );

    // Accommodation details - right column
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Room:", 300, yPos);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(booking.room.name, 300, yPos + 15);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Room Type:", 300, yPos + 40);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(booking.room.type, 300, yPos + 55);

    // Stay Details Section
    yPos += 130;

    // Section title
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("STAY DETAILS", 50, yPos);

    yPos += 25;

    // Draw section background
    doc
      .fillColor(lightGray)
      .roundedRect(50, yPos - 10, doc.page.width - 100, 100, 5)
      .fill();

    // Stay details - left column
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Check-in Date:", 70, yPos);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(formatDate(booking.checkInDate), 70, yPos + 15);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Check-out Date:", 70, yPos + 40);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(formatDate(booking.checkOutDate), 70, yPos + 55);

    // Stay details - right column
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Duration:", 300, yPos);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(booking.duration, 300, yPos + 15);

    // Payment Details Section
    yPos += 110;

    // Section title
    doc
      .fillColor(primaryColor)
      .fontSize(14)
      .font("Helvetica-Bold")
      .text("PAYMENT DETAILS", 50, yPos);

    yPos += 25;

    // Draw section background
    doc
      .fillColor(lightGray)
      .roundedRect(50, yPos - 10, doc.page.width - 100, 130, 5)
      .fill();

    // Payment details - left column
    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Price per semester:", 70, yPos);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(formatCurrency(booking.room.price), 70, yPos + 15);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Total Amount:", 70, yPos + 40);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(formatCurrency(booking.totalAmount), 70, yPos + 55);

    doc
      .font("Helvetica-Bold")
      .fontSize(10)
      .fillColor(secondaryColor)
      .text("Payment Status:", 70, yPos + 80);
    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor(textColor)
      .text(booking.paymentStatus, 70, yPos + 95);

    // Payment details - right column
    if (booking.paymentStatus === "Partial Payment") {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(secondaryColor)
        .text("Amount Paid:", 300, yPos);
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(textColor)
        .text(formatCurrency(booking.totalAmount / 2), 300, yPos + 15);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(secondaryColor)
        .text("Remaining Balance:", 300, yPos + 40);
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(textColor)
        .text(formatCurrency(booking.totalAmount / 2), 300, yPos + 55);
    } else {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(secondaryColor)
        .text("Amount Paid:", 300, yPos);
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(textColor)
        .text(formatCurrency(booking.totalAmount), 300, yPos + 15);
    }

    // Add payment method if available
    if (booking.mobilePayment && booking.mobilePayment.network) {
      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .fillColor(secondaryColor)
        .text("Payment Method:", 300, yPos + 80);
      doc
        .font("Helvetica")
        .fontSize(11)
        .fillColor(textColor)
        .text(
          `Mobile Money (${booking.mobilePayment.network})`,
          300,
          yPos + 95
        );
    }

    // Add payment status badge
    const paymentStatusColors = {
      "Partial Payment": "#FCD34D", // Yellow
      "Full Payment": "#10B981", // Green
    };

    const paymentStatusColor =
      paymentStatusColors[booking.paymentStatus] || "#9CA3AF";

    doc
      .roundedRect(doc.page.width - 150, 80, 100, 25, 10)
      .fillAndStroke(paymentStatusColor, "white");

    doc
      .fillColor("white")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(booking.paymentStatus.toUpperCase(), doc.page.width - 150, 87, {
        align: "center",
        width: 100,
      });

    // Add QR code placeholder
    doc
      .rect(doc.page.width - 150, yPos, 100, 100)
      .lineWidth(1)
      .stroke();

    doc
      .fontSize(10)
      .fillColor(textColor)
      .text("Scan to verify", doc.page.width - 150, yPos + 105, {
        width: 100,
        align: "center",
      });

    // Add footer
    const footerY = doc.page.height - 100;

    // Draw footer background
    doc.fillColor(primaryColor).rect(0, footerY, doc.page.width, 100).fill();

    // Add footer text
    doc
      .fillColor("white")
      .fontSize(14)
      .font("Helvetica-Bold")
      .text(
        `Thank you for booking with ${booking.hostel.name}!`,
        50,
        footerY + 30,
        { align: "center" }
      );

    doc
      .fontSize(10)
      .font("Helvetica")
      .text(
        "This is an official receipt of your booking. Please present this document upon check-in.",
        50,
        footerY + 50,
        { align: "center" }
      );

    doc
      .fontSize(10)
      .text(`Generated on ${new Date().toLocaleString()}`, 50, footerY + 70, {
        align: "center",
      });

    // Add terms and conditions on the same page
    doc
      .addPage()
      .fontSize(16)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("TERMS AND CONDITIONS", 50, 50, { align: "center" });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(textColor)
      .text(
        "1. Check-in time is from 2:00 PM, and check-out time is until 12:00 PM.",
        50,
        90
      )
      .text("2. A valid ID must be presented upon check-in.", 50, 110)
      .text(
        "3. Smoking is not allowed inside the rooms or common areas.",
        50,
        130
      )
      .text("4. Pets are not allowed in the hostel.", 50, 150)
      .text("5. Quiet hours are from 10:00 PM to 7:00 AM.", 50, 170)
      .text(
        "6. Guests are responsible for any damages to hostel property.",
        50,
        190
      )
      .text(
        "7. The hostel is not responsible for any loss of personal belongings.",
        50,
        210
      )
      .text(
        "8. Cancellation policy: Full refund if cancelled 7 days before check-in, 50% refund if cancelled 3-7 days before check-in, no refund if cancelled less than 3 days before check-in.",
        50,
        230,
        { width: 500 }
      )
      .text(
        "9. For any inquiries or assistance, please contact our reception desk.",
        50,
        270
      )
      .text(
        "10. By completing this booking, you agree to abide by all hostel rules and regulations.",
        50,
        290
      );

    // Add contact information
    doc
      .fontSize(14)
      .font("Helvetica-Bold")
      .fillColor(primaryColor)
      .text("CONTACT INFORMATION", 50, 330, { align: "center" });

    doc
      .fontSize(10)
      .font("Helvetica")
      .fillColor(textColor)
      .text(booking.hostel.name, 50, 360, { align: "center" })
      .text(booking.hostel.address, 50, 375, { align: "center" })
      .text("Email: info@hostel.com | Phone: +233 XX XXX XXXX", 50, 390, {
        align: "center",
      })
      .text("Website: www.hostel.com", 50, 405, { align: "center" });

    // Finalize the PDF
    doc.end();
  } catch (error) {
    console.error("Error generating booking report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get all bookings (admin only)
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("student", "name email studentId")
      .populate("hostel", "name address")
      .populate("room", "name type price");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("student", "name email studentId phoneNumber")
      .populate("hostel", "name address owner")
      .populate("room", "name type price");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is authorized to view this booking
    const isAuthorized =
      req.session.user.role === "admin" ||
      (booking.student &&
        booking.student._id.toString() === req.session.user._id.toString()) ||
      (booking.hostel &&
        booking.hostel.owner &&
        booking.hostel.owner.toString() === req.session.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this booking",
      });
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update booking status (admin or hostel owner)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingStatus } = req.body;

    if (
      !["pending", "confirmed", "cancelled", "completed"].includes(
        bookingStatus
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid booking status",
      });
    }

    const booking = await Booking.findById(req.params.id).populate(
      "hostel",
      "owner"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is authorized to update this booking
    const isAuthorized =
      req.session.user.role === "admin" ||
      (booking.hostel &&
        booking.hostel.owner &&
        booking.hostel.owner.toString() === req.session.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    booking.bookingStatus = bookingStatus;
    await booking.save();

    // If booking is cancelled, make room available again
    if (bookingStatus === "cancelled") {
      const room = await Room.findById(booking.room);
      if (room) {
        room.isAvailable = true;
        await room.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Update payment status (admin or hostel owner)
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!["Partial Payment", "Full Payment"].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const booking = await Booking.findById(req.params.id).populate(
      "hostel",
      "owner"
    );

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // Check if user is authorized to update this booking
    const isAuthorized =
      req.session.user.role === "admin" ||
      (booking.hostel &&
        booking.hostel.owner &&
        booking.hostel.owner.toString() === req.session.user._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this booking",
      });
    }

    booking.paymentStatus = paymentStatus;
    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      booking,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get bookings by student ID
exports.getBookingsByStudent = async (req, res) => {
  try {
    const studentId = req.params.studentId;

    // If not admin and not the student, deny access
    if (
      req.session.user.role !== "admin" &&
      req.session.user._id.toString() !== studentId
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view these bookings",
      });
    }

    const bookings = await Booking.find({ student: studentId })
      .populate("hostel", "name address")
      .populate("room", "name type price");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching student bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get bookings by hostel ID (for hostel owners)
exports.getBookingsByHostel = async (req, res) => {
  try {
    const hostelId = req.params.hostelId;

    // Verify hostel exists
    const hostel = await Hostel.findById(hostelId);

    if (!hostel) {
      return res.status(404).json({
        success: false,
        message: "Hostel not found",
      });
    }

    // Authorization check
    const isAuthorized =
      req.session.user.role === "admin" ||
      (hostel.owner &&
        req.session.user &&
        ((req.session.user._id &&
          hostel.owner.toString() === req.session.user._id.toString()) ||
          (req.session.user.id &&
            hostel.owner.toString() === req.session.user.id.toString())));

    if (!isAuthorized) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view bookings for this hostel",
      });
    }

    const bookings = await Booking.find({ hostel: hostelId })
      .populate("room", "name type price")
      .populate("student", "name email studentId");

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching hostel bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get booking statistics (admin only)
exports.getBookingStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({
      bookingStatus: "pending",
    });
    const confirmedBookings = await Booking.countDocuments({
      bookingStatus: "confirmed",
    });
    const cancelledBookings = await Booking.countDocuments({
      bookingStatus: "cancelled",
    });
    const completedBookings = await Booking.countDocuments({
      bookingStatus: "completed",
    });
    const partialPayments = await Booking.countDocuments({
      paymentStatus: "Partial Payment",
    });
    const fullPayments = await Booking.countDocuments({
      paymentStatus: "Full Payment",
    });

    // Calculate total booking value
    const bookingValues = await Booking.aggregate([
      { $match: { bookingStatus: { $in: ["confirmed", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    const totalValue = bookingValues.length > 0 ? bookingValues[0].total : 0;

    // Get bookings by payment status
    const paymentStatus = await Booking.aggregate([
      { $group: { _id: "$paymentStatus", count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalBookings,
        pendingBookings,
        confirmedBookings,
        cancelledBookings,
        completedBookings,
        partialPayments,
        fullPayments,
        totalValue,
        paymentStatus,
      },
    });
  } catch (error) {
    console.error("Error fetching booking stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Get bookings for the currently authenticated user
exports.getCurrentUserBookings = async (req, res) => {
  try {
    // Make sure user is authenticated
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Get the user ID from the session
    const userId = req.session.user._id || req.session.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID not found in session",
      });
    }

    // Fetch bookings for this user
    const bookings = await Booking.find({ student: userId })
      .populate("hostel", "name address")
      .populate("room", "name type price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    console.error("Error fetching current user bookings:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
