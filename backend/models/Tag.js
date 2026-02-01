/**
 * Tag Model
 * For categorizing notes with labels
 */

const mongoose = require('mongoose');

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tag name is required'],
      trim: true,
      maxlength: [30, 'Tag name cannot exceed 30 characters']
    },
    color: {
      type: String,
      default: '#3b82f6',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for unique tag names per user
tagSchema.index({ name: 1, user: 1 }, { unique: true });

const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
