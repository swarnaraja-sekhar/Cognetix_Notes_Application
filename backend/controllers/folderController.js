/**
 * Folder Controller
 * Handles all folder-related operations
 */

const Folder = require('../models/Folder');
const Note = require('../models/Note');

// ============================================
// @desc    Get all folders for current user
// @route   GET /api/folders
// @access  Private
// ============================================
exports.getFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id })
      .populate('parent', 'name')
      .sort({ order: 1, name: 1 });

    // Get note counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const noteCount = await Note.countDocuments({
          user: req.user._id,
          folder: folder._id,
          isTrashed: false
        });
        return {
          ...folder.toObject(),
          noteCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: folders.length,
      folders: foldersWithCounts
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching folders'
    });
  }
};

// ============================================
// @desc    Get folder tree structure
// @route   GET /api/folders/tree
// @access  Private
// ============================================
exports.getFolderTree = async (req, res) => {
  try {
    const folders = await Folder.find({ user: req.user._id }).sort({ order: 1, name: 1 });

    // Build tree structure
    const buildTree = (parentId = null) => {
      return folders
        .filter((folder) => {
          if (parentId === null) {
            return !folder.parent;
          }
          return folder.parent && folder.parent.toString() === parentId.toString();
        })
        .map((folder) => ({
          ...folder.toObject(),
          children: buildTree(folder._id)
        }));
    };

    const tree = buildTree();

    res.status(200).json({
      success: true,
      folders: tree
    });
  } catch (error) {
    console.error('Get folder tree error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching folder tree'
    });
  }
};

// ============================================
// @desc    Create a new folder
// @route   POST /api/folders
// @access  Private
// ============================================
exports.createFolder = async (req, res) => {
  try {
    const { name, parent, icon, color } = req.body;

    // Check if folder already exists at same level
    const existingFolder = await Folder.findOne({
      user: req.user._id,
      parent: parent || null,
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingFolder) {
      return res.status(400).json({
        success: false,
        message: 'Folder with this name already exists at this level'
      });
    }

    // Validate parent folder if provided
    if (parent) {
      const parentFolder = await Folder.findOne({
        _id: parent,
        user: req.user._id
      });

      if (!parentFolder) {
        return res.status(404).json({
          success: false,
          message: 'Parent folder not found'
        });
      }
    }

    // Get max order for new folder
    const maxOrder = await Folder.findOne({
      user: req.user._id,
      parent: parent || null
    }).sort({ order: -1 });

    const folder = await Folder.create({
      name,
      parent: parent || null,
      icon: icon || '📁',
      color: color || '#6b7280',
      order: maxOrder ? maxOrder.order + 1 : 0,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      folder
    });
  } catch (error) {
    console.error('Create folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating folder'
    });
  }
};

// ============================================
// @desc    Update a folder
// @route   PUT /api/folders/:id
// @access  Private
// ============================================
exports.updateFolder = async (req, res) => {
  try {
    const { name, parent, icon, color, order } = req.body;

    let folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Prevent setting folder as its own parent
    if (parent && parent === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'Folder cannot be its own parent'
      });
    }

    // Check if new name conflicts with existing folder at same level
    if (name && name !== folder.name) {
      const existingFolder = await Folder.findOne({
        user: req.user._id,
        parent: parent !== undefined ? parent : folder.parent,
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: folder._id }
      });

      if (existingFolder) {
        return res.status(400).json({
          success: false,
          message: 'Folder with this name already exists at this level'
        });
      }
    }

    folder = await Folder.findByIdAndUpdate(
      req.params.id,
      { name, parent, icon, color, order },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      folder
    });
  } catch (error) {
    console.error('Update folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating folder'
    });
  }
};

// ============================================
// @desc    Delete a folder
// @route   DELETE /api/folders/:id
// @access  Private
// ============================================
exports.deleteFolder = async (req, res) => {
  try {
    const { moveNotesTo } = req.query;

    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    // Check for subfolders
    const subfolders = await Folder.find({
      user: req.user._id,
      parent: folder._id
    });

    if (subfolders.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete folder with subfolders. Delete subfolders first.'
      });
    }

    // Handle notes in the folder
    if (moveNotesTo) {
      // Move notes to specified folder
      await Note.updateMany(
        { user: req.user._id, folder: folder._id },
        { $set: { folder: moveNotesTo === 'null' ? null : moveNotesTo } }
      );
    } else {
      // Remove folder reference from notes
      await Note.updateMany(
        { user: req.user._id, folder: folder._id },
        { $set: { folder: null } }
      );
    }

    await folder.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Folder deleted successfully'
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting folder'
    });
  }
};

// ============================================
// @desc    Get notes in a folder
// @route   GET /api/folders/:id/notes
// @access  Private
// ============================================
exports.getNotesInFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!folder) {
      return res.status(404).json({
        success: false,
        message: 'Folder not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notes = await Note.find({
      user: req.user._id,
      folder: folder._id,
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
      folder: folder._id,
      isTrashed: false,
      isArchived: false
    });

    res.status(200).json({
      success: true,
      folder,
      notes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get notes in folder error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notes'
    });
  }
};

// ============================================
// @desc    Reorder folders
// @route   PUT /api/folders/reorder
// @access  Private
// ============================================
exports.reorderFolders = async (req, res) => {
  try {
    const { folders } = req.body; // Array of { id, order }

    if (!Array.isArray(folders)) {
      return res.status(400).json({
        success: false,
        message: 'Folders must be an array'
      });
    }

    const updatePromises = folders.map(({ id, order }) =>
      Folder.updateOne(
        { _id: id, user: req.user._id },
        { $set: { order } }
      )
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Folders reordered successfully'
    });
  } catch (error) {
    console.error('Reorder folders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while reordering folders'
    });
  }
};
