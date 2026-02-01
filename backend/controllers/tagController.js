/**
 * Tag Controller
 * Handles all tag-related operations
 */

const Tag = require('../models/Tag');
const Note = require('../models/Note');

// ============================================
// @desc    Get all tags for current user
// @route   GET /api/tags
// @access  Private
// ============================================
exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.find({ user: req.user._id }).sort({ name: 1 });

    // Get note counts for each tag
    const tagsWithCounts = await Promise.all(
      tags.map(async (tag) => {
        const noteCount = await Note.countDocuments({
          user: req.user._id,
          tags: tag._id,
          isTrashed: false
        });
        return {
          ...tag.toObject(),
          noteCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: tags.length,
      tags: tagsWithCounts
    });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching tags'
    });
  }
};

// ============================================
// @desc    Create a new tag
// @route   POST /api/tags
// @access  Private
// ============================================
exports.createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    // Check if tag already exists
    const existingTag = await Tag.findOne({
      user: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: 'Tag with this name already exists'
      });
    }

    const tag = await Tag.create({
      name,
      color: color || '#3b82f6',
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      tag
    });
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating tag'
    });
  }
};

// ============================================
// @desc    Update a tag
// @route   PUT /api/tags/:id
// @access  Private
// ============================================
exports.updateTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    let tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Check if new name conflicts with existing tag
    if (name && name !== tag.name) {
      const existingTag = await Tag.findOne({
        user: req.user._id,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: tag._id }
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: 'Tag with this name already exists'
        });
      }
    }

    tag = await Tag.findByIdAndUpdate(
      req.params.id,
      { name, color },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      tag
    });
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating tag'
    });
  }
};

// ============================================
// @desc    Delete a tag
// @route   DELETE /api/tags/:id
// @access  Private
// ============================================
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    // Remove tag from all notes
    await Note.updateMany(
      { user: req.user._id, tags: tag._id },
      { $pull: { tags: tag._id } }
    );

    await tag.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully'
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting tag'
    });
  }
};

// ============================================
// @desc    Get notes by tag
// @route   GET /api/tags/:id/notes
// @access  Private
// ============================================
exports.getNotesByTag = async (req, res) => {
  try {
    const tag = await Tag.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: 'Tag not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notes = await Note.find({
      user: req.user._id,
      tags: tag._id,
      isTrashed: false,
      isArchived: false
    })
      .populate('tags', 'name color')
      .populate('folder', 'name icon')
      .sort({ isPinned: -1, updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Note.countDocuments({
      user: req.user._id,
      tags: tag._id,
      isTrashed: false,
      isArchived: false
    });

    res.status(200).json({
      success: true,
      tag,
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notes by tag error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notes'
    });
  }
};
