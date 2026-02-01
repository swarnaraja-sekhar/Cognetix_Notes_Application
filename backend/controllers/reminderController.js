/**
 * Reminder Controller
 * Handles all reminder-related operations
 */

const Reminder = require('../models/Reminder');
const Note = require('../models/Note');

// ============================================
// @desc    Get all reminders for current user
// @route   GET /api/reminders
// @access  Private
// ============================================
exports.getReminders = async (req, res) => {
  try {
    const { status, upcoming } = req.query;

    const query = { user: req.user._id };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.reminderDate = { $gte: new Date() };
      query.status = 'pending';
    }

    const reminders = await Reminder.find(query)
      .populate({
        path: 'note',
        select: 'title color'
      })
      .sort({ reminderDate: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reminders'
    });
  }
};

// ============================================
// @desc    Get upcoming reminders (next 7 days)
// @route   GET /api/reminders/upcoming
// @access  Private
// ============================================
exports.getUpcomingReminders = async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const reminders = await Reminder.find({
      user: req.user._id,
      status: 'pending',
      reminderDate: {
        $gte: now,
        $lte: sevenDaysLater
      }
    })
      .populate({
        path: 'note',
        select: 'title color'
      })
      .sort({ reminderDate: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    console.error('Get upcoming reminders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reminders'
    });
  }
};

// ============================================
// @desc    Create a reminder
// @route   POST /api/reminders
// @access  Private
// ============================================
exports.createReminder = async (req, res) => {
  try {
    const { noteId, title, reminderDate, isRecurring, recurringPattern, notificationMethods } = req.body;

    // Validate note if provided
    if (noteId) {
      const note = await Note.findOne({
        _id: noteId,
        user: req.user._id,
        isTrashed: false
      });

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found'
        });
      }
    }

    // Validate reminder date
    if (new Date(reminderDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reminder date must be in the future'
      });
    }

    const reminder = await Reminder.create({
      note: noteId || null,
      user: req.user._id,
      title,
      reminderDate: new Date(reminderDate),
      isRecurring: isRecurring || false,
      recurringPattern: recurringPattern || null,
      notificationMethods: notificationMethods || ['app']
    });

    await reminder.populate({
      path: 'note',
      select: 'title color'
    });

    res.status(201).json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating reminder'
    });
  }
};

// ============================================
// @desc    Update a reminder
// @route   PUT /api/reminders/:id
// @access  Private
// ============================================
exports.updateReminder = async (req, res) => {
  try {
    const { title, reminderDate, isRecurring, recurringPattern, notificationMethods, status } = req.body;

    let reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    // Validate reminder date if being updated
    if (reminderDate && new Date(reminderDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Reminder date must be in the future'
      });
    }

    reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      {
        title,
        reminderDate: reminderDate ? new Date(reminderDate) : reminder.reminderDate,
        isRecurring,
        recurringPattern,
        notificationMethods,
        status
      },
      { new: true, runValidators: true }
    ).populate({
      path: 'note',
      select: 'title color'
    });

    res.status(200).json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating reminder'
    });
  }
};

// ============================================
// @desc    Delete a reminder
// @route   DELETE /api/reminders/:id
// @access  Private
// ============================================
exports.deleteReminder = async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    await reminder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting reminder'
    });
  }
};

// ============================================
// @desc    Mark reminder as completed
// @route   PUT /api/reminders/:id/complete
// @access  Private
// ============================================
exports.completeReminder = async (req, res) => {
  try {
    let reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    reminder.status = 'completed';
    await reminder.save();

    // If recurring, create next reminder
    if (reminder.isRecurring && reminder.recurringPattern) {
      const nextDate = calculateNextDate(reminder.reminderDate, reminder.recurringPattern);
      
      if (nextDate) {
        await Reminder.create({
          note: reminder.note,
          user: req.user._id,
          title: reminder.title,
          reminderDate: nextDate,
          isRecurring: true,
          recurringPattern: reminder.recurringPattern,
          notificationMethods: reminder.notificationMethods
        });
      }
    }

    await reminder.populate({
      path: 'note',
      select: 'title color'
    });

    res.status(200).json({
      success: true,
      reminder
    });
  } catch (error) {
    console.error('Complete reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while completing reminder'
    });
  }
};

// ============================================
// @desc    Snooze a reminder
// @route   PUT /api/reminders/:id/snooze
// @access  Private
// ============================================
exports.snoozeReminder = async (req, res) => {
  try {
    const { snoozeMinutes } = req.body;

    let reminder = await Reminder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: 'Reminder not found'
      });
    }

    const snoozeDuration = snoozeMinutes || 15;
    reminder.reminderDate = new Date(Date.now() + snoozeDuration * 60 * 1000);
    reminder.status = 'pending';
    await reminder.save();

    await reminder.populate({
      path: 'note',
      select: 'title color'
    });

    res.status(200).json({
      success: true,
      reminder,
      message: `Reminder snoozed for ${snoozeDuration} minutes`
    });
  } catch (error) {
    console.error('Snooze reminder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while snoozing reminder'
    });
  }
};

// ============================================
// @desc    Get reminders for a specific note
// @route   GET /api/reminders/note/:noteId
// @access  Private
// ============================================
exports.getRemindersByNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.noteId,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const reminders = await Reminder.find({
      note: req.params.noteId,
      user: req.user._id
    }).sort({ reminderDate: 1 });

    res.status(200).json({
      success: true,
      count: reminders.length,
      reminders
    });
  } catch (error) {
    console.error('Get reminders by note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reminders'
    });
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate the next occurrence date for recurring reminders
 */
function calculateNextDate(currentDate, pattern) {
  const date = new Date(currentDate);

  switch (pattern) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return null;
  }

  return date;
}
