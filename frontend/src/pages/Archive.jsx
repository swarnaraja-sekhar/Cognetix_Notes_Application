/**
 * Archive Page Component
 * Displays and manages archived notes
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  FiArchive,
  FiArrowLeft,
  FiClock,
  FiTag,
  FiFolder
} from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import NoteCard from '../components/NoteCard';

const Archive = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchArchivedNotes();
  }, []);

  const fetchArchivedNotes = async () => {
    try {
      setLoading(true);
      const response = await notesAPI.getArchived();
      setNotes(response.data.notes);
    } catch (error) {
      console.error('Error fetching archived notes:', error);
      toast.error('Failed to load archived notes');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (noteId) => {
    try {
      setActionLoading(true);
      await notesAPI.archive(noteId);
      setNotes(notes.filter((note) => note._id !== noteId));
      toast.success('Note unarchived');
    } catch (error) {
      console.error('Error unarchiving note:', error);
      toast.error('Failed to unarchive note');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (noteId) => {
    try {
      setActionLoading(true);
      await notesAPI.delete(noteId);
      setNotes(notes.filter((note) => note._id !== noteId));
      toast.success('Note moved to trash');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner text="Loading archived notes..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            to="/dashboard"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiArchive className="w-6 h-6 text-indigo-500" />
              Archive
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {notes.length} archived {notes.length === 1 ? 'note' : 'notes'}
            </p>
          </div>
        </div>

        {/* Notes Grid */}
        {notes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <FiArchive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No archived notes</h3>
            <p className="text-gray-500 mb-6">
              Archive notes to keep them safe without cluttering your dashboard
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => (
              <div
                key={note._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                style={{ borderTopColor: note.color, borderTopWidth: '3px' }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {note.title}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                    {note.content}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag._id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full"
                          style={{
                            backgroundColor: tag.color + '20',
                            color: tag.color
                          }}
                        >
                          <FiTag className="w-3 h-3" />
                          {tag.name}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{note.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Folder */}
                  {note.folder && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                      <FiFolder className="w-3 h-3" />
                      {note.folder.name}
                    </div>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                    <FiClock className="w-3 h-3" />
                    Archived {formatDate(note.archivedAt)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleUnarchive(note._id)}
                      className="flex-1 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      disabled={actionLoading}
                    >
                      Unarchive
                    </button>
                    <Link
                      to={`/notes/${note._id}`}
                      className="flex-1 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
