/**
 * Notes Routes - Enhanced
 * Handles CRUD operations for user notes with advanced features
 * All routes are protected and require JWT authentication
 */

const express = require('express');
const router = express.Router();

// Import controller methods
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePinNote,
  searchNotes,
  getTrashedNotes,
  restoreNote,
  emptyTrash,
  getArchivedNotes,
  archiveNote,
  toggleFavorite,
  duplicateNote
} = require('../controllers/noteController');

// Import middleware
const { protect } = require('../middleware/authMiddleware');
const { searchLimiter } = require('../middleware/rateLimiter');

// ============================================
// APPLY AUTHENTICATION MIDDLEWARE
// All routes below require authentication
// ============================================
router.use(protect);

// ============================================
// SPECIAL ROUTES (must come before /:id routes)
// ============================================

/**
 * @route   GET /api/notes/search
 * @desc    Search notes by title or content
 * @access  Private
 */
router.get('/search', searchLimiter, searchNotes);

/**
 * @route   GET /api/notes/trash
 * @desc    Get all trashed notes
 * @access  Private
 */
router.get('/trash', getTrashedNotes);

/**
 * @route   DELETE /api/notes/trash
 * @desc    Empty trash (permanently delete all trashed notes)
 * @access  Private
 */
router.delete('/trash', emptyTrash);

/**
 * @route   GET /api/notes/archive
 * @desc    Get all archived notes
 * @access  Private
 */
router.get('/archive', getArchivedNotes);

// ============================================
// NOTES CRUD ROUTES
// ============================================

/**
 * @route   GET /api/notes
 * @desc    Get all notes for the authenticated user
 * @access  Private
 */
router.get('/', getNotes);

/**
 * @route   POST /api/notes
 * @desc    Create a new note
 * @access  Private
 */
router.post('/', createNote);

/**
 * @route   GET /api/notes/:id
 * @desc    Get a single note by ID
 * @access  Private
 */
router.get('/:id', getNoteById);

/**
 * @route   PUT /api/notes/:id
 * @desc    Update a note
 * @access  Private
 */
router.put('/:id', updateNote);

/**
 * @route   DELETE /api/notes/:id
 * @desc    Delete a note (soft delete by default, ?permanent=true for hard delete)
 * @access  Private
 */
router.delete('/:id', deleteNote);

// ============================================
// NOTE ACTIONS
// ============================================

/**
 * @route   PATCH /api/notes/:id/pin
 * @desc    Toggle pin status of a note
 * @access  Private
 */
router.patch('/:id/pin', togglePinNote);

/**
 * @route   PATCH /api/notes/:id/favorite
 * @desc    Toggle favorite status of a note
 * @access  Private
 */
router.patch('/:id/favorite', toggleFavorite);

/**
 * @route   PUT /api/notes/:id/archive
 * @desc    Archive/unarchive a note
 * @access  Private
 */
router.put('/:id/archive', archiveNote);

/**
 * @route   PUT /api/notes/:id/restore
 * @desc    Restore a note from trash
 * @access  Private
 */
router.put('/:id/restore', restoreNote);

/**
 * @route   POST /api/notes/:id/duplicate
 * @desc    Duplicate a note
 * @access  Private
 */
router.post('/:id/duplicate', duplicateNote);

module.exports = router;
