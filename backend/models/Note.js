/**
 * Note Model - Enhanced
 * Defines the schema for user notes with all features
 */

const mongoose = require('mongoose');

// Attachment sub-schema for file uploads
const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  publicId: {
    type: String // For Cloudinary
  }
}, { _id: true, timestamps: true });

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      minlength: [1, 'Title must be at least 1 character'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    content: {
      type: String,
      required: [true, 'Note content is required'],
      trim: true,
      minlength: [1, 'Content must be at least 1 character'],
      maxlength: [50000, 'Content cannot exceed 50000 characters']
    },
    contentType: {
      type: String,
      enum: ['plain', 'markdown', 'richtext'],
      default: 'markdown'
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true
    },
    folder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Folder',
      default: null
    },
    tags: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tag'
    }],
    isPinned: {
      type: Boolean,
      default: false
    },
    isArchived: {
      type: Boolean,
      default: false
    },
    isTrashed: {
      type: Boolean,
      default: false
    },
    trashedAt: {
      type: Date,
      default: null
    },
    color: {
      type: String,
      default: '#ffffff',
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid color format']
    },
    attachments: [attachmentSchema],
    wordCount: {
      type: Number,
      default: 0
    },
    characterCount: {
      type: Number,
      default: 0
    },
    order: {
      type: Number,
      default: 0
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    lastViewedAt: {
      type: Date,
      default: null
    },
    viewCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// ============================================
// INDEXES
// ============================================

noteSchema.index({ user: 1, createdAt: -1 });
noteSchema.index({ user: 1, isPinned: -1, updatedAt: -1 });
noteSchema.index({ user: 1, isTrashed: 1 });
noteSchema.index({ user: 1, isArchived: 1 });
noteSchema.index({ user: 1, folder: 1 });
noteSchema.index({ user: 1, tags: 1 });
noteSchema.index({ title: 'text', content: 'text' });

// ============================================
// PRE-SAVE MIDDLEWARE
// ============================================

noteSchema.pre('save', function(next) {
  // Calculate word and character count
  if (this.isModified('content')) {
    this.characterCount = this.content.length;
    this.wordCount = this.content.trim().split(/\s+/).filter(word => word.length > 0).length;
  }
  next();
});

// ============================================
// STATIC METHODS
// ============================================

noteSchema.statics.findByUser = function (userId, options = {}) {
  const query = { 
    user: userId, 
    isTrashed: false,
    isArchived: false 
  };
  
  if (options.folder) query.folder = options.folder;
  if (options.tag) query.tags = options.tag;
  
  return this.find(query)
    .populate('tags', 'name color')
    .populate('folder', 'name icon color')
    .sort({ isPinned: -1, updatedAt: -1 });
};

noteSchema.statics.findTrashed = function (userId) {
  return this.find({ user: userId, isTrashed: true })
    .sort({ trashedAt: -1 });
};

noteSchema.statics.findArchived = function (userId) {
  return this.find({ user: userId, isArchived: true, isTrashed: false })
    .sort({ updatedAt: -1 });
};

noteSchema.statics.findByIdAndVerifyOwner = async function (noteId, userId) {
  const note = await this.findOne({ _id: noteId, user: userId });
  return note;
};

// Auto-delete trashed notes after 30 days
noteSchema.statics.cleanupTrash = async function () {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.deleteMany({
    isTrashed: true,
    trashedAt: { $lt: thirtyDaysAgo }
  });
};

// ============================================
// INSTANCE METHODS
// ============================================

noteSchema.methods.belongsTo = function (userId) {
  return this.user.toString() === userId.toString();
};

noteSchema.methods.moveToTrash = function () {
  this.isTrashed = true;
  this.trashedAt = new Date();
  return this.save();
};

noteSchema.methods.restore = function () {
  this.isTrashed = false;
  this.trashedAt = null;
  return this.save();
};

noteSchema.methods.archive = function () {
  this.isArchived = true;
  return this.save();
};

noteSchema.methods.unarchive = function () {
  this.isArchived = false;
  return this.save();
};

noteSchema.methods.incrementViewCount = function () {
  this.viewCount += 1;
  this.lastViewedAt = new Date();
  return this.save();
};

// ============================================
// VIRTUAL FIELDS
// ============================================

noteSchema.virtual('preview').get(function () {
  if (this.content.length <= 150) {
    return this.content;
  }
  return this.content.substring(0, 150) + '...';
});

noteSchema.virtual('isExpired').get(function () {
  if (!this.isTrashed || !this.trashedAt) return false;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.trashedAt < thirtyDaysAgo;
});

noteSchema.set('toJSON', { virtuals: true });
noteSchema.set('toObject', { virtuals: true });

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
