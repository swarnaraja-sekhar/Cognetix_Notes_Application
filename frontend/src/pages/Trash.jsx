/**
 * Trash Page Component
 * Displays and manages deleted notes
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiTrash2,
  FiRefreshCw,
  FiAlertTriangle,
  FiArrowLeft,
  FiClock,
  FiTrash
} from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';

const Trash = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTrashedNotes();
  }, []);

  const fetchTrashedNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getTrashed();
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching trashed notes:', error);
      toast.error('Failed to load trashed notes');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (noteId) => {
    try {
      setActionLoading(true);
      await notesAPI.restore(noteId);
      setNotes(notes.filter((note) => note._id !== noteId));
      toast.success('Note restored successfully');
    } catch (error) {
      console.error('Error restoring note:', error);
      toast.error('Failed to restore note');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePermanentDelete = async () => {
    if (!selectedNote) return;

    try {
      setActionLoading(true);
      await notesAPI.delete(selectedNote._id, true);
      setNotes(notes.filter((note) => note._id !== selectedNote._id));
      toast.success('Note permanently deleted');
      setShowDeleteConfirm(false);
      setSelectedNote(null);
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEmptyTrash = async () => {
    try {
      setActionLoading(true);
      const response = await notesAPI.emptyTrash();
      setNotes([]);
      toast.success(`${response.data.deletedCount} notes permanently deleted`);
      setShowEmptyConfirm(false);
    } catch (error) {
      console.error('Error emptying trash:', error);
      toast.error('Failed to empty trash');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (deletedAt) => {
    const deleteDate = new Date(deletedAt);
    const now = new Date();
    const thirtyDaysLater = new Date(deleteDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    const daysRemaining = Math.ceil((thirtyDaysLater - now) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysRemaining);
  };

  if (loading) {
    return <LoadingSpinner text="Loading trashed notes..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FiTrash2 className="w-6 h-6 text-red-500" />
                Trash
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Notes are permanently deleted after 30 days
              </p>
            </div>
          </div>

          {notes.length > 0 && (
            <button
              onClick={() => setShowEmptyConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              disabled={actionLoading}
            >
              <FiTrash className="w-4 h-4" />
              Empty Trash
            </button>
          )}
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <FiAlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-800 font-medium">
              Items in trash will be automatically deleted after 30 days
            </p>
            <p className="text-xs text-amber-600 mt-1">
              You can restore notes before they are permanently deleted
            </p>
          </div>
        </div>

        {/* Notes List */}
        {notes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FiTrash2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Trash is empty</h3>
            <p className="text-gray-500 mb-6">
              Deleted notes will appear here
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: note.color || '#e5e7eb' }}
                      />
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {note.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {note.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3 h-3" />
                        Deleted {formatDate(note.deletedAt)}
                      </span>
                      <span className="text-amber-600 font-medium">
                        {getDaysRemaining(note.deletedAt)} days remaining
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleRestore(note._id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      disabled={actionLoading}
                    >
                      <FiRefreshCw className="w-4 h-4" />
                      Restore
                    </button>
                    <button
                      onClick={() => {
                        setSelectedNote(note);
                        setShowDeleteConfirm(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={actionLoading}
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty Trash Confirmation Modal */}
        <ConfirmModal
          isOpen={showEmptyConfirm}
          onClose={() => setShowEmptyConfirm(false)}
          onConfirm={handleEmptyTrash}
          title="Empty Trash"
          message={`Are you sure you want to permanently delete all ${notes.length} notes in trash? This action cannot be undone.`}
          confirmText="Empty Trash"
          confirmStyle="danger"
          loading={actionLoading}
        />

        {/* Delete Note Confirmation Modal */}
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setSelectedNote(null);
          }}
          onConfirm={handlePermanentDelete}
          title="Delete Permanently"
          message={`Are you sure you want to permanently delete "${selectedNote?.title}"? This action cannot be undone.`}
          confirmText="Delete Permanently"
          confirmStyle="danger"
          loading={actionLoading}
        />
      </div>
    </div>
  );
};

export default Trash;
