/**
 * Share Routes
 * Handles note sharing endpoints
 */

const express = require('express');
const router = express.Router();
const {
  shareNote,
  generateShareLink,
  getSharedNoteByToken,
  getNotesSharedWithMe,
  getNotesSharedByMe,
  updateShare,
  removeShare,
  getNoteShareSettings
} = require('../controllers/shareController');
const { protect } = require('../middleware/authMiddleware');
const { shareLimiter } = require('../middleware/rateLimiter');

// Public route - access shared note by token
router.get('/public/:token', getSharedNoteByToken);

// Protected routes
router.use(protect);

// Share operations
router.post('/', shareNote);
router.post('/link', shareLimiter, generateShareLink);

// Get shared notes
router.get('/with-me', getNotesSharedWithMe);
router.get('/by-me', getNotesSharedByMe);

// Get share settings for a note
router.get('/note/:noteId', getNoteShareSettings);

// Update and remove shares
router.route('/:id')
  .put(updateShare)
  .delete(removeShare);

module.exports = router;
