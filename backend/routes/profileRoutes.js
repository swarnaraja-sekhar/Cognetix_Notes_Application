/**
 * Profile Routes
 * Handles user profile and settings endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  updatePreferences,
  changePassword,
  deleteAccount,
  getStats,
  exportData
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');
const { exportLimiter } = require('../middleware/rateLimiter');

// All routes are protected
router.use(protect);

// Profile routes
router.route('/')
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteAccount);

// Preferences
router.put('/preferences', updatePreferences);

// Password change
router.put('/password', changePassword);

// Stats
router.get('/stats', getStats);

// Export data
router.get('/export', exportLimiter, exportData);

module.exports = router;
