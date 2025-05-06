// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Check if user is a student
exports.isStudent = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student access required' });
  }
  next();
};

// Check if user is an admin
exports.isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin access required' });
  }
  next();
};

// Check if user is a hostel owner
exports.isHostelOwner = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'hostel-owner') {
    return res.status(403).json({ message: 'Access denied. Hostel owner access required' });
  }
  next();
};