/**
 * SharedNote Model
 * For sharing notes with other users
 */

const mongoose = require('mongoose');

const sharedNoteSchema = new mongoose.Schema(
  {
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sharedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    permission: {
      type: String,
      enum: ['read', 'edit'],
      default: 'read'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate shares
sharedNoteSchema.index({ note: 1, sharedWith: 1 }, { unique: true });

const SharedNote = mongoose.model('SharedNote', sharedNoteSchema);

module.exports = SharedNote;
