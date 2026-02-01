/**
 * Create Note Page
 * Form to create a new note
 */

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { 
  HiOutlineArrowLeft,
  HiOutlineBookmark,
  HiBookmark
} from 'react-icons/hi';
import toast from 'react-hot-toast';

// Available note colors
const NOTE_COLORS = [
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#fecaca' },
  { name: 'Orange', value: '#fed7aa' },
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Blue', value: '#bfdbfe' },
  { name: 'Purple', value: '#e9d5ff' },
  { name: 'Pink', value: '#fbcfe8' },
];

const CreateNote = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
    color: '#ffffff'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Toggle pin
  const togglePin = () => {
    setFormData(prev => ({ ...prev, isPinned: !prev.isPinned }));
  };

  // Select color
  const selectColor = (color) => {
    setFormData(prev => ({ ...prev, color }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      await notesAPI.create(formData);
      toast.success('Note created successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Create note error:', err);
      toast.error(err.response?.data?.message || 'Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-custom py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard"
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create New Note
          </h1>
        </div>

        {/* Pin Button */}
        <button
          type="button"
          onClick={togglePin}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
            formData.isPinned
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
              : 'bg-gray-100 text-gray-600 dark:bg-dark-card dark:text-dark-muted'
          }`}
        >
          {formData.isPinned ? (
            <HiBookmark className="w-5 h-5" />
          ) : (
            <HiOutlineBookmark className="w-5 h-5" />
          )}
          <span className="text-sm font-medium">
            {formData.isPinned ? 'Pinned' : 'Pin Note'}
          </span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card p-6">
        {/* Color Picker */}
        <div className="mb-6">
          <label className="label">Note Color</label>
          <div className="flex flex-wrap gap-2">
            {NOTE_COLORS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => selectColor(color.value)}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  formData.color === color.value
                    ? 'border-primary-500 ring-2 ring-primary-500 ring-offset-2'
                    : 'border-gray-300 dark:border-dark-border'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Title Field */}
        <div className="mb-4">
          <label htmlFor="title" className="label">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className={`input ${errors.title ? 'input-error' : ''}`}
            placeholder="Enter note title..."
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-500">{errors.title}</p>
          )}
        </div>

        {/* Content Field */}
        <div className="mb-6">
          <label htmlFor="content" className="label">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={12}
            className={`input resize-none ${errors.content ? 'input-error' : ''}`}
            placeholder="Write your note here..."
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-500">{errors.content}</p>
          )}
          <p className="mt-1 text-xs text-gray-400 dark:text-dark-muted">
            {formData.content.length} / 10000 characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3">
          <Link
            to="/dashboard"
            className="btn-secondary"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </span>
            ) : (
              'Create Note'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateNote;
