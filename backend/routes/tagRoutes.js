/**
 * Tag Routes
 * Handles all tag-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  getNotesByTag
} = require('../controllers/tagController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Tag CRUD routes
router.route('/')
  .get(getTags)
  .post(createTag);

router.route('/:id')
  .put(updateTag)
  .delete(deleteTag);

// Get notes by tag
router.get('/:id/notes', getNotesByTag);

module.exports = router;
