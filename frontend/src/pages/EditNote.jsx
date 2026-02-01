/**
 * Edit Note Page
 * Form to edit an existing note
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
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

const EditNote = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    isPinned: false,
    color: '#ffffff'
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [notFound, setNotFound] = useState(false);

  // Fetch note data
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await notesAPI.getById(id);
        const note = response.data.note;
        
        setFormData({
          title: note.title,
          content: note.content,
          isPinned: note.isPinned,
          color: note.color || '#ffffff'
        });
      } catch (err) {
        console.error('Error fetching note:', err);
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(err.response?.data?.message || 'Failed to load note');
          navigate('/dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, navigate]);

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
      await notesAPI.update(id, formData);
      toast.success('Note updated successfully!');
      navigate(`/notes/${id}`);
    } catch (err) {
      console.error('Update note error:', err);
      toast.error(err.response?.data?.message || 'Failed to update note');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container-custom py-16">
        <LoadingSpinner size="lg" text="Loading note..." />
      </div>
    );
  }

  // Not found state
  if (notFound) {
    return (
      <div className="container-custom py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Note Not Found
        </h2>
        <p className="text-gray-600 dark:text-dark-muted mb-6">
          The note you're looking for doesn't exist or you don't have permission to access it.
        </p>
        <Link to="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Link
            to={`/notes/${id}`}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
          >
            <HiOutlineArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Note
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
            to={`/notes/${id}`}
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
                Saving...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditNote;
