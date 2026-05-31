// Import jwt to verify tokens
const jwt = require('jsonwebtoken');
// Import User model to fetch user data
const User = require('../models/User');

// Middleware to check if user is authenticated
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];

    // If no token found
    if (!token) {
      return res.status(401).json({ message: 'No token, not authorized' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Keep backwards-compatible fields used across controllers/routes
    req.userId = decoded.userId;

    // Fetch full user data from database
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Store full user object in request for use in controllers
    req.user = user;

    // Continue to next middleware
    next();
  } catch (error) {
    console.log('❌ Auth error: ' + error.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = authMiddleware;
