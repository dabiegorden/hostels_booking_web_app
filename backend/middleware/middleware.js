const isAuthenticated = (req, res, next) => {
    if (req.session.userId && req.session.userRole) {
      return next();
    }
    return res.status(401).json({ message: 'Not authenticated' });
  };
  
  const isAdmin = (req, res, next) => {
    if (req.session.userId && req.session.userRole === 'admin') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Admin permission required.' });
  };
  
  const isHostelOwner = (req, res, next) => {
    if (req.session.userId && req.session.userRole === 'hostelOwner') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Hostel owner permission required.' });
  };
  
  const isStudent = (req, res, next) => {
    if (req.session.userId && req.session.userRole === 'student') {
      return next();
    }
    return res.status(403).json({ message: 'Access denied. Student permission required.' });
  };
  
  module.exports = {
    isAuthenticated,
    isAdmin,
    isHostelOwner,
    isStudent
  };