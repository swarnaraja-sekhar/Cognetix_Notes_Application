/**
 * Share Controller
 * Handles note sharing functionality
 */

const SharedNote = require('../models/SharedNote');
const Note = require('../models/Note');
const User = require('../models/User');
const crypto = require('crypto');

// ============================================
// @desc    Share a note with another user
// @route   POST /api/share
// @access  Private
// ============================================
exports.shareNote = async (req, res) => {
  try {
    const { noteId, email, permission, expiresAt } = req.body;

    // Find the note
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

    // Find the user to share with
    const sharedWithUser = await User.findOne({ email });

    if (!sharedWithUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Cannot share with yourself
    if (sharedWithUser._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot share note with yourself'
      });
    }

    // Check if already shared
    const existingShare = await SharedNote.findOne({
      note: noteId,
      sharedWith: sharedWithUser._id
    });

    if (existingShare) {
      // Update existing share
      existingShare.permission = permission || 'read';
      existingShare.expiresAt = expiresAt ? new Date(expiresAt) : null;
      await existingShare.save();

      return res.status(200).json({
        success: true,
        message: 'Share settings updated',
        share: existingShare
      });
    }

    // Create new share
    const share = await SharedNote.create({
      note: noteId,
      owner: req.user._id,
      sharedWith: sharedWithUser._id,
      permission: permission || 'read',
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    // Populate the share
    await share.populate([
      { path: 'note', select: 'title' },
      { path: 'sharedWith', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      share
    });
  } catch (error) {
    console.error('Share note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sharing note'
    });
  }
};

// ============================================
// @desc    Generate a public share link
// @route   POST /api/share/link
// @access  Private
// ============================================
exports.generateShareLink = async (req, res) => {
  try {
    const { noteId, expiresAt } = req.body;

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

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString('hex');

    // Create public share
    const share = await SharedNote.create({
      note: noteId,
      owner: req.user._id,
      sharedWith: null,
      permission: 'read',
      shareToken,
      expiresAt: expiresAt ? new Date(expiresAt) : null
    });

    const shareLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/shared/${shareToken}`;

    res.status(201).json({
      success: true,
      shareLink,
      share
    });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating share link'
    });
  }
};

// ============================================
// @desc    Get note by share token (public access)
// @route   GET /api/share/public/:token
// @access  Public
// ============================================
exports.getSharedNoteByToken = async (req, res) => {
  try {
    const share = await SharedNote.findOne({
      shareToken: req.params.token
    }).populate({
      path: 'note',
      select: 'title content color contentType createdAt updatedAt',
      populate: { path: 'tags', select: 'name color' }
    }).populate('owner', 'name');

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Shared note not found'
      });
    }

    // Check if expired
    if (share.expiresAt && new Date(share.expiresAt) < new Date()) {
      return res.status(403).json({
        success: false,
        message: 'This share link has expired'
      });
    }

    // Increment view count
    share.viewCount += 1;
    await share.save();

    res.status(200).json({
      success: true,
      note: share.note,
      owner: share.owner,
      permission: share.permission,
      viewCount: share.viewCount
    });
  } catch (error) {
    console.error('Get shared note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shared note'
    });
  }
};

// ============================================
// @desc    Get notes shared with me
// @route   GET /api/share/with-me
// @access  Private
// ============================================
exports.getNotesSharedWithMe = async (req, res) => {
  try {
    const shares = await SharedNote.find({
      sharedWith: req.user._id,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    })
      .populate({
        path: 'note',
        select: 'title content color isPinned createdAt updatedAt',
        populate: { path: 'tags', select: 'name color' }
      })
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    // Filter out any shares where note was deleted
    const validShares = shares.filter((share) => share.note && !share.note.isTrashed);

    res.status(200).json({
      success: true,
      count: validShares.length,
      shares: validShares
    });
  } catch (error) {
    console.error('Get notes shared with me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shared notes'
    });
  }
};

// ============================================
// @desc    Get notes I've shared
// @route   GET /api/share/by-me
// @access  Private
// ============================================
exports.getNotesSharedByMe = async (req, res) => {
  try {
    const shares = await SharedNote.find({
      owner: req.user._id
    })
      .populate({
        path: 'note',
        select: 'title color createdAt'
      })
      .populate('sharedWith', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: shares.length,
      shares
    });
  } catch (error) {
    console.error('Get notes shared by me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shared notes'
    });
  }
};

// ============================================
// @desc    Update share permissions
// @route   PUT /api/share/:id
// @access  Private
// ============================================
exports.updateShare = async (req, res) => {
  try {
    const { permission, expiresAt } = req.body;

    const share = await SharedNote.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }

    share.permission = permission || share.permission;
    share.expiresAt = expiresAt ? new Date(expiresAt) : share.expiresAt;
    await share.save();

    res.status(200).json({
      success: true,
      share
    });
  } catch (error) {
    console.error('Update share error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating share'
    });
  }
};

// ============================================
// @desc    Remove share (unshare)
// @route   DELETE /api/share/:id
// @access  Private
// ============================================
exports.removeShare = async (req, res) => {
  try {
    const share = await SharedNote.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!share) {
      return res.status(404).json({
        success: false,
        message: 'Share not found'
      });
    }

    await share.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Share removed successfully'
    });
  } catch (error) {
    console.error('Remove share error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing share'
    });
  }
};

// ============================================
// @desc    Get share settings for a note
// @route   GET /api/share/note/:noteId
// @access  Private
// ============================================
exports.getNoteShareSettings = async (req, res) => {
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

    const shares = await SharedNote.find({
      note: req.params.noteId,
      owner: req.user._id
    })
      .populate('sharedWith', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      shares
    });
  } catch (error) {
    console.error('Get note share settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching share settings'
    });
  }
};
