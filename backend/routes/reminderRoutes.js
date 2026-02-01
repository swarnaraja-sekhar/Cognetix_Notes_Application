/**
 * Reminder Routes
 * Handles all reminder-related endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getReminders,
  getUpcomingReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  completeReminder,
  snoozeReminder,
  getRemindersByNote
} = require('../controllers/reminderController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// Get upcoming reminders
router.get('/upcoming', getUpcomingReminders);

// Reminder CRUD routes
router.route('/')
  .get(getReminders)
  .post(createReminder);

router.route('/:id')
  .put(updateReminder)
  .delete(deleteReminder);

// Reminder actions
router.put('/:id/complete', completeReminder);
router.put('/:id/snooze', snoozeReminder);

// Get reminders for a specific note
router.get('/note/:noteId', getRemindersByNote);

module.exports = router;
