// Check if user is authenticated 
exports.isAuthenticated = (req, res, next) => { 
  if (!req.session.user) { 
    return res.status(401).json({ 
      message: 'Authentication required', 
      redirect: '/auth/login' // Add redirect URL for frontend 
    }); 
  } 
  next(); 
};

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

  // // Debug session info
  // console.log("Session user:", {
  //   id: req.session.user.id,
  //   _id: req.session.user._id,
  //   role: req.session.user.role,
  // })

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


// Check if user is a student 
exports.isStudent = (req, res, next) => { 
  if (!req.session.user || req.session.user.role !== 'student') { 
    return res.status(403).json({ 
      message: 'Access denied. Student access required', 
      redirect: '/students' // Add redirect URL for frontend 
    }); 
  } 
  next(); 
};

// Check if user is an admin 
exports.isAdmin = (req, res, next) => { 
  if (!req.session.user || req.session.user.role !== 'admin') { 
    return res.status(403).json({ 
      message: 'Access denied. Admin access required', 
      redirect: '/admin' // Add redirect URL for frontend 
    }); 
  } 
  next(); 
};

// Check if user is a hostel owner 
exports.isHostelOwner = (req, res, next) => { 
  if (!req.session.user || req.session.user.role !== 'hostel-owner') { 
    return res.status(403).json({ 
      message: 'Access denied. Hostel owner access required', 
      redirect: 'hostel-owner-login' // Add redirect URL for frontend 
    }); 
  } 
  next(); 
};