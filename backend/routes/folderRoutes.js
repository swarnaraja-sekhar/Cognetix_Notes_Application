/**
 * Folder Routes
 * Handles all folder-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getFolders,
  getFolderTree,
  createFolder,
  updateFolder,
  deleteFolder,
  getNotesInFolder,
  reorderFolders
} = require('../controllers/folderController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Folder CRUD routes
router.route('/')
  .get(getFolders)
  .post(createFolder);

// Special routes
router.get('/tree', getFolderTree);
router.put('/reorder', reorderFolders);

router.route('/:id')
  .put(updateFolder)
  .delete(deleteFolder);

// Get notes in folder
router.get('/:id/notes', getNotesInFolder);

module.exports = router;
