/**
 * Template Routes
 * Handles all note template endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  useTemplate,
  duplicateTemplate,
  getCategories
} = require('../controllers/templateController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get template categories
router.get('/categories', getCategories);

// Template CRUD routes
router.route('/')
  .get(getTemplates)
  .post(createTemplate);

router.route('/:id')
  .get(getTemplate)
  .put(updateTemplate)
  .delete(deleteTemplate);

// Use and duplicate templates
router.post('/:id/use', useTemplate);
router.post('/:id/duplicate', duplicateTemplate);

module.exports = router;
