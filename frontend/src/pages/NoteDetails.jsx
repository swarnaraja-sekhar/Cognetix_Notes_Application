/**
 * Note Details Page
 * Displays a single note with full content
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import { 
  HiOutlineArrowLeft,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineClock,
  HiOutlineCalendar
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const NoteDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // State
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);

  // Fetch note
  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await notesAPI.getById(id);
        setNote(response.data.note);
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

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await notesAPI.delete(id);
      toast.success('Note deleted');
      navigate('/dashboard');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete note');
    }
  };

  // Handle toggle pin
  const handleTogglePin = async () => {
    try {
      const response = await notesAPI.togglePin(id);
      setNote(response.data.note);
      toast.success(response.data.message);
    } catch (err) {
      console.error('Toggle pin error:', err);
      toast.error('Failed to update pin status');
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
        <Link
          to="/dashboard"
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-dark-muted dark:hover:text-white transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
          <span>Back to Notes</span>
        </Link>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleTogglePin}
            className={`p-2 rounded-lg transition-colors ${
              note?.isPinned
                ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30'
                : 'text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border'
            }`}
            title={note?.isPinned ? 'Unpin note' : 'Pin note'}
          >
            {note?.isPinned ? (
              <HiBookmark className="w-5 h-5" />
            ) : (
              <HiOutlineBookmark className="w-5 h-5" />
            )}
          </button>
          
          <Link
            to={`/notes/${id}/edit`}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
            title="Edit note"
          >
            <HiOutlinePencil className="w-5 h-5" />
          </Link>
          
          <button
            onClick={() => setDeleteModal(true)}
            className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-dark-muted dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
            title="Delete note"
          >
            <HiOutlineTrash className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Note Card */}
      <div 
        className="card p-8"
        style={{ 
          backgroundColor: note?.color !== '#ffffff' ? `${note?.color}15` : undefined 
        }}
      >
        {/* Pinned Badge */}
        {note?.isPinned && (
          <div className="inline-flex items-center space-x-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full text-sm font-medium mb-4">
            <HiBookmark className="w-4 h-4" />
            <span>Pinned</span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {note?.title}
        </h1>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-dark-muted mb-8 pb-6 border-b border-gray-200 dark:border-dark-border">
          <div className="flex items-center space-x-1">
            <HiOutlineCalendar className="w-4 h-4" />
            <span>Created: {formatDate(note?.createdAt)}</span>
          </div>
          {note?.updatedAt !== note?.createdAt && (
            <div className="flex items-center space-x-1">
              <HiOutlineClock className="w-4 h-4" />
              <span>Updated: {formatDate(note?.updatedAt)}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-700 dark:text-dark-text whitespace-pre-wrap leading-relaxed">
            {note?.content}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="text-sm text-gray-500 hover:text-gray-700 dark:text-dark-muted dark:hover:text-dark-text"
        >
          ← Back to all notes
        </Link>
        
        <Link
          to={`/notes/${id}/edit`}
          className="btn-primary btn-sm"
        >
          <HiOutlinePencil className="w-4 h-4 mr-1" />
          Edit Note
        </Link>
      </div>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Note"
        message={`Are you sure you want to delete "${note?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default NoteDetails;
