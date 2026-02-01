/**
 * Template Model
 * Pre-defined note templates
 */

const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Template name is required'],
      trim: true,
      maxlength: [100, 'Template name cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    content: {
      type: String,
      required: [true, 'Template content is required'],
      maxlength: [10000, 'Template content cannot exceed 10000 characters']
    },
    category: {
      type: String,
      enum: ['personal', 'work', 'meeting', 'project', 'journal', 'todo', 'other'],
      default: 'other'
    },
    icon: {
      type: String,
      default: '📝'
    },
    isSystem: {
      type: Boolean,
      default: false
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null // null for system templates
    }
  },
  {
    timestamps: true
  }
);

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
