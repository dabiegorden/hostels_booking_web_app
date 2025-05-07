const Settings = require("../models/Settings")

// Get system settings
exports.getSettings = async (req, res) => {
  try {
    // Find settings or create default if not exists
    let settings = await Settings.findOne()

    if (!settings) {
      settings = await Settings.create({
        siteName: "Hostel Booking System",
        siteDescription: "Find and book the best hostels",
        contactEmail: "admin@gmail.com",
        contactPhone: "+233 599495508",
        bookingFee: 0,
        taxRate: 0,
        maintenanceMode: false,
      })
    }

    // If not admin, remove sensitive information
    if (req.session.user && req.session.user.role !== "admin") {
      settings = settings.toObject()
      delete settings.paymentGateways
    }

    res.status(200).json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update system settings (admin only)
exports.updateSettings = async (req, res) => {
  try {
    const {
      siteName,
      siteDescription,
      contactEmail,
      contactPhone,
      address,
      logo,
      favicon,
      socialLinks,
      paymentGateways,
      bookingFee,
      taxRate,
      maintenanceMode,
      termsAndConditions,
      privacyPolicy,
    } = req.body

    // Find settings or create default if not exists
    let settings = await Settings.findOne()

    if (!settings) {
      settings = new Settings({
        contactEmail: "admin@hostelbooking.com",
        contactPhone: "+1234567890",
      })
    }

    // Update fields
    if (siteName) settings.siteName = siteName
    if (siteDescription) settings.siteDescription = siteDescription
    if (contactEmail) settings.contactEmail = contactEmail
    if (contactPhone) settings.contactPhone = contactPhone
    if (address) settings.address = address
    if (logo) settings.logo = logo
    if (favicon) settings.favicon = favicon
    if (socialLinks) settings.socialLinks = socialLinks
    if (paymentGateways) settings.paymentGateways = paymentGateways
    if (bookingFee !== undefined) settings.bookingFee = bookingFee
    if (taxRate !== undefined) settings.taxRate = taxRate
    if (maintenanceMode !== undefined) settings.maintenanceMode = maintenanceMode
    if (termsAndConditions) settings.termsAndConditions = termsAndConditions
    if (privacyPolicy) settings.privacyPolicy = privacyPolicy

    await settings.save()

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      settings,
    })
  } catch (error) {
    console.error("Error updating settings:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get terms and conditions
exports.getTermsAndConditions = async (req, res) => {
  try {
    const settings = await Settings.findOne().select("termsAndConditions")

    if (!settings || !settings.termsAndConditions) {
      return res.status(404).json({
        success: false,
        message: "Terms and conditions not found",
      })
    }

    res.status(200).json({
      success: true,
      termsAndConditions: settings.termsAndConditions,
    })
  } catch (error) {
    console.error("Error fetching terms and conditions:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Get privacy policy
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const settings = await Settings.findOne().select("privacyPolicy")

    if (!settings || !settings.privacyPolicy) {
      return res.status(404).json({
        success: false,
        message: "Privacy policy not found",
      })
    }

    res.status(200).json({
      success: true,
      privacyPolicy: settings.privacyPolicy,
    })
  } catch (error) {
    console.error("Error fetching privacy policy:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Add payment gateway (admin only)
exports.addPaymentGateway = async (req, res) => {
  try {
    const { name, apiKey, secretKey } = req.body

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Payment gateway name is required",
      })
    }

    const settings = await Settings.findOne()

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      })
    }

    // Check if gateway already exists
    const existingGateway = settings.paymentGateways.find((gateway) => gateway.name === name)

    if (existingGateway) {
      return res.status(400).json({
        success: false,
        message: "Payment gateway already exists",
      })
    }

    // Add new gateway
    settings.paymentGateways.push({
      name,
      apiKey,
      secretKey,
      isActive: true,
    })

    await settings.save()

    res.status(201).json({
      success: true,
      message: "Payment gateway added successfully",
      paymentGateways: settings.paymentGateways,
    })
  } catch (error) {
    console.error("Error adding payment gateway:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Update payment gateway (admin only)
exports.updatePaymentGateway = async (req, res) => {
  try {
    const { name, apiKey, secretKey, isActive } = req.body
    const gatewayId = req.params.id

    const settings = await Settings.findOne()

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      })
    }

    // Find gateway by ID
    const gatewayIndex = settings.paymentGateways.findIndex((gateway) => gateway._id.toString() === gatewayId)

    if (gatewayIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Payment gateway not found",
      })
    }

    // Update gateway
    if (name) settings.paymentGateways[gatewayIndex].name = name
    if (apiKey) settings.paymentGateways[gatewayIndex].apiKey = apiKey
    if (secretKey) settings.paymentGateways[gatewayIndex].secretKey = secretKey
    if (isActive !== undefined) settings.paymentGateways[gatewayIndex].isActive = isActive

    await settings.save()

    res.status(200).json({
      success: true,
      message: "Payment gateway updated successfully",
      paymentGateways: settings.paymentGateways,
    })
  } catch (error) {
    console.error("Error updating payment gateway:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}

// Delete payment gateway (admin only)
exports.deletePaymentGateway = async (req, res) => {
  try {
    const gatewayId = req.params.id

    const settings = await Settings.findOne()

    if (!settings) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      })
    }

    // Find gateway by ID
    const gatewayIndex = settings.paymentGateways.findIndex((gateway) => gateway._id.toString() === gatewayId)

    if (gatewayIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Payment gateway not found",
      })
    }

    // Remove gateway
    settings.paymentGateways.splice(gatewayIndex, 1)

    await settings.save()

    res.status(200).json({
      success: true,
      message: "Payment gateway deleted successfully",
      paymentGateways: settings.paymentGateways,
    })
  } catch (error) {
    console.error("Error deleting payment gateway:", error)
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
