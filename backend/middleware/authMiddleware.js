/**
 * Authentication Middleware
 * Protects routes by verifying JWT tokens
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect middleware - Verifies JWT token and attaches user to request
 * Use this middleware on routes that require authentication
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // Check for Authorization header with Bearer token
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      // Extract token from "Bearer <token>"
      token = authHeader.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided. Please login to continue.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user by ID from token payload (exclude password)
    const user = await User.findById(decoded.id).select('-password');

    // Check if user still exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Token is invalid.'
      });
    }

    // Attach user to request object for use in route handlers
    req.user = user;
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);

    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    }

    // Generic error
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this resource.'
    });
  }
};

/**
 * Optional auth middleware - Attaches user if token is valid, but doesn't block
 * Use for routes that work differently for authenticated vs anonymous users
 */
const optionalAuth = async (req, res, next) => {
  let token;

  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer')) {
      token = authHeader.split(' ')[1];
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
    console.log('Optional auth failed:', error.message);
  }
  
  next();
};

/**
 * Verify note ownership middleware
 * Must be used after protect middleware
 * Ensures the note belongs to the authenticated user
 */
const verifyNoteOwnership = async (req, res, next) => {
  try {
    const Note = require('../models/Note');
    const noteId = req.params.id;
    const userId = req.user._id;

    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Check if the note belongs to the authenticated user
    if (!note.belongsTo(userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own notes.'
      });
    }

    // Attach note to request for use in route handler
    req.note = note;
    next();
  } catch (error) {
    console.error('Note Ownership Verification Error:', error.message);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Error verifying note ownership'
    });
  }
};

module.exports = {
  protect,
  optionalAuth,
  verifyNoteOwnership
};
