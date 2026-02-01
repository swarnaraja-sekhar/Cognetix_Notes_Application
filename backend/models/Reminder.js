/**
 * Reminder Model
 * For setting reminders on notes
 */

const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reminderDate: {
      type: Date,
      required: [true, 'Reminder date is required']
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Reminder message cannot exceed 200 characters']
    },
    isRecurring: {
      type: Boolean,
      default: false
    },
    recurringType: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', null],
      default: null
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    notifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Index for querying pending reminders
reminderSchema.index({ reminderDate: 1, isCompleted: 1 });
reminderSchema.index({ user: 1, isCompleted: 1 });

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;
