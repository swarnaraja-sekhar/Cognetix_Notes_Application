/**
 * Notes Controller - Enhanced
 * Handles CRUD operations for user notes with advanced features
 */

const Note = require('../models/Note');
const Tag = require('../models/Tag');
const Folder = require('../models/Folder');

// ============================================
// CONTROLLER METHODS
// ============================================

/**
 * @desc    Create a new note
 * @route   POST /api/notes
 * @access  Private
 */
const createNote = async (req, res) => {
  try {
    const { title, content, isPinned, color, tags, folder, contentType } = req.body;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content for the note'
      });
    }

    // Validate tags if provided
    if (tags && tags.length > 0) {
      const validTags = await Tag.find({ _id: { $in: tags }, user: req.user._id });
      if (validTags.length !== tags.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more invalid tags'
        });
      }
    }

    // Validate folder if provided
    if (folder) {
      const validFolder = await Folder.findOne({ _id: folder, user: req.user._id });
      if (!validFolder) {
        return res.status(400).json({
          success: false,
          message: 'Invalid folder'
        });
      }
    }

    // Create note with user reference
    const note = await Note.create({
      title: title.trim(),
      content: content.trim(),
      user: req.user._id,
      isPinned: isPinned || false,
      color: color || '#ffffff',
      tags: tags || [],
      folder: folder || null,
      contentType: contentType || 'plain'
    });

    // Populate tags and folder
    await note.populate([
      { path: 'tags', select: 'name color' },
      { path: 'folder', select: 'name icon' }
    ]);

    console.log(`✅ Note created: "${note.title}" by user ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    console.error('Create Note Error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error creating note. Please try again.'
    });
  }
};

/**
 * @desc    Get all notes for logged-in user
 * @route   GET /api/notes
 * @access  Private
 */
const getNotes = async (req, res) => {
  try {
    // Get query parameters for filtering and pagination
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'updatedAt',
      sortOrder = 'desc',
      tag,
      folder,
      color,
      favorite
    } = req.query;

    // Build query - only get notes belonging to the authenticated user
    const query = { 
      user: req.user._id,
      isTrashed: false,
      isArchived: false
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Filter by folder
    if (folder) {
      query.folder = folder === 'null' ? null : folder;
    }

    // Filter by color
    if (color) {
      query.color = color;
    }

    // Filter by favorites
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortOptions = {};
    sortOptions.isPinned = -1; // Always sort pinned notes first
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const notes = await Note.find(query)
      .populate('tags', 'name color')
      .populate('folder', 'name icon')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await Note.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notes.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      notes
    });
  } catch (error) {
    console.error('Get Notes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notes'
    });
  }
};

/**
 * @desc    Get a single note by ID
 * @route   GET /api/notes/:id
 * @access  Private
 */
const getNoteById = async (req, res) => {
  try {
    const noteId = req.params.id;

    // Find note and verify ownership
    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id,
      isTrashed: false
    })
      .populate('tags', 'name color')
      .populate('folder', 'name icon');

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to access it'
      });
    }

    // Increment view count
    note.viewCount += 1;
    await note.save();

    res.status(200).json({
      success: true,
      note
    });
  } catch (error) {
    console.error('Get Note By ID Error:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error fetching note'
    });
  }
};

/**
 * @desc    Update a note
 * @route   PUT /api/notes/:id
 * @access  Private
 */
const updateNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const { title, content, isPinned, color, tags, folder, contentType, isFavorite } = req.body;

    // Find note and verify ownership
    let note = await Note.findOne({
      _id: noteId,
      user: req.user._id,
      isTrashed: false
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to update it'
      });
    }

    // Validate tags if provided
    if (tags && tags.length > 0) {
      const validTags = await Tag.find({ _id: { $in: tags }, user: req.user._id });
      if (validTags.length !== tags.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more invalid tags'
        });
      }
    }

    // Validate folder if provided
    if (folder && folder !== 'null') {
      const validFolder = await Folder.findOne({ _id: folder, user: req.user._id });
      if (!validFolder) {
        return res.status(400).json({
          success: false,
          message: 'Invalid folder'
        });
      }
    }

    // Build update object
    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (content !== undefined) updateFields.content = content.trim();
    if (isPinned !== undefined) updateFields.isPinned = isPinned;
    if (color !== undefined) updateFields.color = color;
    if (tags !== undefined) updateFields.tags = tags;
    if (folder !== undefined) updateFields.folder = folder === 'null' ? null : folder;
    if (contentType !== undefined) updateFields.contentType = contentType;
    if (isFavorite !== undefined) updateFields.isFavorite = isFavorite;

    // Validate at least one field to update
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one field to update'
      });
    }

    // Update note
    note = await Note.findByIdAndUpdate(
      noteId,
      updateFields,
      { new: true, runValidators: true }
    )
      .populate('tags', 'name color')
      .populate('folder', 'name icon');

    console.log(`✅ Note updated: "${note.title}" by user ${req.user.email}`);

    res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      note
    });
  } catch (error) {
    console.error('Update Note Error:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating note'
    });
  }
};

/**
 * @desc    Delete a note (soft delete - move to trash)
 * @route   DELETE /api/notes/:id
 * @access  Private
 */
const deleteNote = async (req, res) => {
  try {
    const noteId = req.params.id;
    const { permanent } = req.query;

    // Find note and verify ownership
    const note = await Note.findOne({
      _id: noteId,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to delete it'
      });
    }

    if (permanent === 'true') {
      // Permanently delete the note
      await Note.findByIdAndDelete(noteId);
      console.log(`✅ Note permanently deleted: "${note.title}" by user ${req.user.email}`);
      
      res.status(200).json({
        success: true,
        message: 'Note permanently deleted',
        deletedNote: {
          id: note._id,
          title: note.title
        }
      });
    } else {
      // Soft delete - move to trash
      await note.moveToTrash();
      console.log(`✅ Note moved to trash: "${note.title}" by user ${req.user.email}`);

      res.status(200).json({
        success: true,
        message: 'Note moved to trash',
        note
      });
    }
  } catch (error) {
    console.error('Delete Note Error:', error);

    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error deleting note'
    });
  }
};

/**
 * @desc    Toggle pin status of a note
 * @route   PATCH /api/notes/:id/pin
 * @access  Private
 */
const togglePinNote = async (req, res) => {
  try {
    const noteId = req.params.id;

    // Find note and verify ownership
    let note = await Note.findOne({
      _id: noteId,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found or you do not have permission to modify it'
      });
    }

    // Toggle pin status
    note = await Note.findByIdAndUpdate(
      noteId,
      { isPinned: !note.isPinned },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: note.isPinned ? 'Note pinned' : 'Note unpinned',
      note
    });
  } catch (error) {
    console.error('Toggle Pin Note Error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error toggling pin status'
    });
  }
};

/**
 * @desc    Search notes
 * @route   GET /api/notes/search
 * @access  Private
 */
const searchNotes = async (req, res) => {
  try {
    const { q, tag, folder, color } = req.query;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a search query'
      });
    }

    const query = {
      user: req.user._id,
      isTrashed: false,
      isArchived: false,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } }
      ]
    };

    if (tag) query.tags = tag;
    if (folder) query.folder = folder === 'null' ? null : folder;
    if (color) query.color = color;

    const notes = await Note.find(query)
      .populate('tags', 'name color')
      .populate('folder', 'name icon')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      query: q,
      notes
    });
  } catch (error) {
    console.error('Search Notes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching notes'
    });
  }
};

/**
 * @desc    Get trashed notes
 * @route   GET /api/notes/trash
 * @access  Private
 */
const getTrashedNotes = async (req, res) => {
  try {
    const notes = await Note.findTrashed(req.user._id)
      .populate('tags', 'name color')
      .populate('folder', 'name icon')
      .sort({ deletedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Get Trashed Notes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching trashed notes'
    });
  }
};

/**
 * @desc    Restore note from trash
 * @route   PUT /api/notes/:id/restore
 * @access  Private
 */
const restoreNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
      isTrashed: true
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found in trash'
      });
    }

    await note.restore();

    await note.populate([
      { path: 'tags', select: 'name color' },
      { path: 'folder', select: 'name icon' }
    ]);

    res.status(200).json({
      success: true,
      message: 'Note restored successfully',
      note
    });
  } catch (error) {
    console.error('Restore Note Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error restoring note'
    });
  }
};

/**
 * @desc    Empty trash (permanently delete all trashed notes)
 * @route   DELETE /api/notes/trash
 * @access  Private
 */
const emptyTrash = async (req, res) => {
  try {
    const result = await Note.deleteMany({
      user: req.user._id,
      isTrashed: true
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} notes permanently deleted`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Empty Trash Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error emptying trash'
    });
  }
};

/**
 * @desc    Get archived notes
 * @route   GET /api/notes/archive
 * @access  Private
 */
const getArchivedNotes = async (req, res) => {
  try {
    const notes = await Note.findArchived(req.user._id)
      .populate('tags', 'name color')
      .populate('folder', 'name icon')
      .sort({ archivedAt: -1 });

    res.status(200).json({
      success: true,
      count: notes.length,
      notes
    });
  } catch (error) {
    console.error('Get Archived Notes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching archived notes'
    });
  }
};

/**
 * @desc    Archive a note
 * @route   PUT /api/notes/:id/archive
 * @access  Private
 */
const archiveNote = async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
      isTrashed: false
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    await note.archive();

    res.status(200).json({
      success: true,
      message: note.isArchived ? 'Note archived' : 'Note unarchived',
      note
    });
  } catch (error) {
    console.error('Archive Note Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error archiving note'
    });
  }
};

/**
 * @desc    Toggle favorite status
 * @route   PATCH /api/notes/:id/favorite
 * @access  Private
 */
const toggleFavorite = async (req, res) => {
  try {
    let note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
      isTrashed: false
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { isFavorite: !note.isFavorite },
      { new: true }
    )
      .populate('tags', 'name color')
      .populate('folder', 'name icon');

    res.status(200).json({
      success: true,
      message: note.isFavorite ? 'Added to favorites' : 'Removed from favorites',
      note
    });
  } catch (error) {
    console.error('Toggle Favorite Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling favorite'
    });
  }
};

/**
 * @desc    Duplicate a note
 * @route   POST /api/notes/:id/duplicate
 * @access  Private
 */
const duplicateNote = async (req, res) => {
  try {
    const originalNote = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
      isTrashed: false
    });

    if (!originalNote) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const duplicatedNote = await Note.create({
      title: `${originalNote.title} (Copy)`,
      content: originalNote.content,
      user: req.user._id,
      color: originalNote.color,
      tags: originalNote.tags,
      folder: originalNote.folder,
      contentType: originalNote.contentType,
      isPinned: false,
      isFavorite: false
    });

    await duplicatedNote.populate([
      { path: 'tags', select: 'name color' },
      { path: 'folder', select: 'name icon' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Note duplicated successfully',
      note: duplicatedNote
    });
  } catch (error) {
    console.error('Duplicate Note Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error duplicating note'
    });
  }
};

module.exports = {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  deleteNote,
  togglePinNote,
  searchNotes,
  getTrashedNotes,
  restoreNote,
  emptyTrash,
  getArchivedNotes,
  archiveNote,
  toggleFavorite,
  duplicateNote
};
