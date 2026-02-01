/**
 * Folder Model
 * For organizing notes into categories
 */

const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Folder name is required'],
      trim: true,
      maxlength: [50, 'Folder name cannot exceed 50 characters']
    },
    icon: {
      type: String,
      default: '📁'
    },
    color: {
      type: String,
      default: '#6b7280',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound index for unique folder names per user at same level
folderSchema.index({ name: 1, user: 1, parent: 1 }, { unique: true });

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;
