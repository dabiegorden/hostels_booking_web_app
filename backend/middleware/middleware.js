// Authentication middleware
exports.isAuthenticated = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Authentication required" })
  }

  // Ensure user ID is properly set in both formats
  if (req.session.user._id === undefined && req.session.user.id !== undefined) {
    req.session.user._id = req.session.user.id
  } else if (req.session.user.id === undefined && req.session.user._id !== undefined) {
    req.session.user.id = req.session.user._id
  }

  next()
}

// Role-based middleware
exports.isAdmin = (req, res, next) => {
  if (req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

exports.isStudent = (req, res, next) => {
  if (req.session.user.role !== "student") {
    return res.status(403).json({ message: "Student access required" })
  }
  next()
}

exports.isHostelOwner = (req, res, next) => {
  if (req.session.user.role !== "hostel-owner") {
    return res.status(403).json({ message: "Hostel owner access required" })
  }
  next()
}
