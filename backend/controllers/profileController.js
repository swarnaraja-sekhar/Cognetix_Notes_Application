/**
 * Profile Controller
 * Handles user profile and settings operations
 */

const User = require('../models/User');
const Note = require('../models/Note');
const Folder = require('../models/Folder');
const Tag = require('../models/Tag');
const bcrypt = require('bcryptjs');

// ============================================
// @desc    Get current user profile
// @route   GET /api/profile
// @access  Private
// ============================================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get user stats
    const [totalNotes, totalFolders, totalTags, archivedNotes, trashedNotes] = await Promise.all([
      Note.countDocuments({ user: req.user._id, isTrashed: false, isArchived: false }),
      Folder.countDocuments({ user: req.user._id }),
      Tag.countDocuments({ user: req.user._id }),
      Note.countDocuments({ user: req.user._id, isArchived: true, isTrashed: false }),
      Note.countDocuments({ user: req.user._id, isTrashed: true })
    ]);

    res.status(200).json({
      success: true,
      user: {
        ...user.toJSON(),
        stats: {
          totalNotes,
          totalFolders,
          totalTags,
          archivedNotes,
          trashedNotes
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
};

// ============================================
// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
// ============================================
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
};

// ============================================
// @desc    Update user preferences
// @route   PUT /api/profile/preferences
// @access  Private
// ============================================
exports.updatePreferences = async (req, res) => {
  try {
    const { theme, defaultNoteColor, defaultContentType, notesPerPage, emailNotifications } = req.body;

    const updateData = {};
    if (theme !== undefined) updateData['preferences.theme'] = theme;
    if (defaultNoteColor !== undefined) updateData['preferences.defaultNoteColor'] = defaultNoteColor;
    if (defaultContentType !== undefined) updateData['preferences.defaultContentType'] = defaultContentType;
    if (notesPerPage !== undefined) updateData['preferences.notesPerPage'] = notesPerPage;
    if (emailNotifications !== undefined) updateData['preferences.emailNotifications'] = emailNotifications;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating preferences'
    });
  }
};

// ============================================
// @desc    Change password
// @route   PUT /api/profile/password
// @access  Private
// ============================================
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
};

// ============================================
// @desc    Delete user account
// @route   DELETE /api/profile
// @access  Private
// ============================================
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Password is incorrect'
      });
    }

    // Delete all user data
    await Promise.all([
      Note.deleteMany({ user: req.user._id }),
      Folder.deleteMany({ user: req.user._id }),
      Tag.deleteMany({ user: req.user._id })
    ]);

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting account'
    });
  }
};

// ============================================
// @desc    Get user activity stats
// @route   GET /api/profile/stats
// @access  Private
// ============================================
exports.getStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalNotes,
      notesThisMonth,
      totalWords,
      mostUsedTags,
      notesByDay
    ] = await Promise.all([
      Note.countDocuments({ user: req.user._id, isTrashed: false }),
      Note.countDocuments({
        user: req.user._id,
        isTrashed: false,
        createdAt: { $gte: thirtyDaysAgo }
      }),
      Note.aggregate([
        { $match: { user: req.user._id, isTrashed: false } },
        { $group: { _id: null, totalWords: { $sum: '$wordCount' } } }
      ]),
      Note.aggregate([
        { $match: { user: req.user._id, isTrashed: false } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'tags',
            localField: '_id',
            foreignField: '_id',
            as: 'tag'
          }
        },
        { $unwind: '$tag' },
        { $project: { name: '$tag.name', color: '$tag.color', count: 1 } }
      ]),
      Note.aggregate([
        {
          $match: {
            user: req.user._id,
            isTrashed: false,
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalNotes,
        notesThisMonth,
        totalWords: totalWords[0]?.totalWords || 0,
        mostUsedTags,
        notesByDay
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
};

// ============================================
// @desc    Export user data
// @route   GET /api/profile/export
// @access  Private
// ============================================
exports.exportData = async (req, res) => {
  try {
    const [user, notes, folders, tags] = await Promise.all([
      User.findById(req.user._id),
      Note.find({ user: req.user._id }).populate('tags', 'name color').populate('folder', 'name'),
      Folder.find({ user: req.user._id }),
      Tag.find({ user: req.user._id })
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        name: user.name,
        email: user.email,
        preferences: user.preferences
      },
      notes: notes.map((note) => ({
        title: note.title,
        content: note.content,
        color: note.color,
        isPinned: note.isPinned,
        tags: note.tags.map((t) => t.name),
        folder: note.folder?.name || null,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      })),
      folders: folders.map((folder) => ({
        name: folder.name,
        icon: folder.icon,
        color: folder.color
      })),
      tags: tags.map((tag) => ({
        name: tag.name,
        color: tag.color
      }))
    };

    res.status(200).json({
      success: true,
      data: exportData
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while exporting data'
    });
  }
};
