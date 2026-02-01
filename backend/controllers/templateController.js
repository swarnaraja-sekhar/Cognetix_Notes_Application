/**
 * Template Controller
 * Handles all note template operations
 */

const Template = require('../models/Template');

// ============================================
// @desc    Get all templates (user's + public)
// @route   GET /api/templates
// @access  Private
// ============================================
exports.getTemplates = async (req, res) => {
  try {
    const { category, search } = req.query;

    const query = {
      $or: [
        { user: req.user._id },
        { isPublic: true }
      ]
    };

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ]
        }
      ];
      delete query.$or;
    }

    const templates = await Template.find(query)
      .populate('user', 'name')
      .sort({ usageCount: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: templates.length,
      templates
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching templates'
    });
  }
};

// ============================================
// @desc    Get single template
// @route   GET /api/templates/:id
// @access  Private
// ============================================
exports.getTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user._id },
        { isPublic: true }
      ]
    }).populate('user', 'name');

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    res.status(200).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching template'
    });
  }
};

// ============================================
// @desc    Create a new template
// @route   POST /api/templates
// @access  Private
// ============================================
exports.createTemplate = async (req, res) => {
  try {
    const { name, description, content, category, isPublic, variables, color, icon } = req.body;

    const template = await Template.create({
      name,
      description,
      content,
      category: category || 'personal',
      isPublic: isPublic || false,
      variables: variables || [],
      color: color || '#ffffff',
      icon: icon || '📝',
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating template'
    });
  }
};

// ============================================
// @desc    Update a template
// @route   PUT /api/templates/:id
// @access  Private
// ============================================
exports.updateTemplate = async (req, res) => {
  try {
    let template = await Template.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or you do not have permission'
      });
    }

    const { name, description, content, category, isPublic, variables, color, icon } = req.body;

    template = await Template.findByIdAndUpdate(
      req.params.id,
      { name, description, content, category, isPublic, variables, color, icon },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating template'
    });
  }
};

// ============================================
// @desc    Delete a template
// @route   DELETE /api/templates/:id
// @access  Private
// ============================================
exports.deleteTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found or you do not have permission'
      });
    }

    await template.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting template'
    });
  }
};

// ============================================
// @desc    Use a template (increment usage count)
// @route   POST /api/templates/:id/use
// @access  Private
// ============================================
exports.useTemplate = async (req, res) => {
  try {
    const template = await Template.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user._id },
        { isPublic: true }
      ]
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    // Increment usage count
    template.usageCount += 1;
    await template.save();

    // Process variables if provided
    let processedContent = template.content;
    const { variableValues } = req.body;

    if (variableValues && template.variables.length > 0) {
      template.variables.forEach((variable) => {
        const value = variableValues[variable.name] || variable.defaultValue || '';
        const placeholder = new RegExp(`{{${variable.name}}}`, 'g');
        processedContent = processedContent.replace(placeholder, value);
      });
    }

    res.status(200).json({
      success: true,
      template: {
        ...template.toObject(),
        processedContent
      }
    });
  } catch (error) {
    console.error('Use template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while using template'
    });
  }
};

// ============================================
// @desc    Duplicate a template
// @route   POST /api/templates/:id/duplicate
// @access  Private
// ============================================
exports.duplicateTemplate = async (req, res) => {
  try {
    const originalTemplate = await Template.findOne({
      _id: req.params.id,
      $or: [
        { user: req.user._id },
        { isPublic: true }
      ]
    });

    if (!originalTemplate) {
      return res.status(404).json({
        success: false,
        message: 'Template not found'
      });
    }

    const duplicatedTemplate = await Template.create({
      name: `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      content: originalTemplate.content,
      category: originalTemplate.category,
      isPublic: false,
      variables: originalTemplate.variables,
      color: originalTemplate.color,
      icon: originalTemplate.icon,
      user: req.user._id
    });

    res.status(201).json({
      success: true,
      template: duplicatedTemplate
    });
  } catch (error) {
    console.error('Duplicate template error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while duplicating template'
    });
  }
};

// ============================================
// @desc    Get template categories
// @route   GET /api/templates/categories
// @access  Private
// ============================================
exports.getCategories = async (req, res) => {
  try {
    const categories = [
      { id: 'personal', name: 'Personal', icon: '👤' },
      { id: 'work', name: 'Work', icon: '💼' },
      { id: 'meeting', name: 'Meeting', icon: '📅' },
      { id: 'project', name: 'Project', icon: '📊' },
      { id: 'todo', name: 'To-Do', icon: '✅' },
      { id: 'journal', name: 'Journal', icon: '📔' },
      { id: 'other', name: 'Other', icon: '📝' }
    ];

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
};
