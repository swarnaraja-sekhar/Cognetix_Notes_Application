/**
 * Shared Note Page Component
 * Displays a publicly shared note via share token
 */

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shareAPI } from '../services/api';
import {
  FiFileText,
  FiUser,
  FiClock,
  FiEye,
  FiTag,
  FiAlertCircle,
  FiHome
} from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';

const SharedNote = () => {
  const { token } = useParams();
  const [note, setNote] = useState(null);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    fetchSharedNote();
  }, [token]);

  const fetchSharedNote = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shareAPI.getSharedByToken(token);
      setNote(response.data.note);
      setOwner(response.data.owner);
      setViewCount(response.data.viewCount);
    } catch (error) {
      console.error('Error fetching shared note:', error);
      if (error.response?.status === 404) {
        setError('This shared note does not exist or has been removed.');
      } else if (error.response?.status === 403) {
        setError('This share link has expired.');
      } else {
        setError('Failed to load the shared note. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderContent = (content, contentType) => {
    if (contentType === 'markdown') {
      // Simple markdown rendering - in production, use a proper markdown library
      return (
        <div className="prose max-w-none">
          {content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) {
              return <h1 key={index} className="text-2xl font-bold mb-4">{line.slice(2)}</h1>;
            }
            if (line.startsWith('## ')) {
              return <h2 key={index} className="text-xl font-bold mb-3">{line.slice(3)}</h2>;
            }
            if (line.startsWith('### ')) {
              return <h3 key={index} className="text-lg font-bold mb-2">{line.slice(4)}</h3>;
            }
            if (line.startsWith('- ') || line.startsWith('* ')) {
              return <li key={index} className="ml-4">{line.slice(2)}</li>;
            }
            if (line.trim() === '') {
              return <br key={index} />;
            }
            return <p key={index} className="mb-2">{line}</p>;
          })}
        </div>
      );
    }
    return (
      <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
        {content}
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading shared note..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Note
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiHome className="w-4 h-4" />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FiFileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <span className="text-sm text-gray-500">Shared Note</span>
                <p className="text-sm font-medium text-gray-700">
                  by {owner?.name || 'Anonymous'}
                </p>
              </div>
            </div>
            <Link
              to="/"
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Create your own notes →
            </Link>
          </div>
        </div>
      </div>

      {/* Note Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <article
          className="bg-white rounded-xl shadow-sm overflow-hidden"
          style={{ borderTop: `4px solid ${note.color || '#6366f1'}` }}
        >
          <div className="p-8">
            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {note.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
              <span className="flex items-center gap-1">
                <FiUser className="w-4 h-4" />
                {owner?.name || 'Anonymous'}
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                {formatDate(note.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <FiEye className="w-4 h-4" />
                {viewCount} {viewCount === 1 ? 'view' : 'views'}
              </span>
            </div>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {note.tags.map((tag) => (
                  <span
                    key={tag._id}
                    className="inline-flex items-center gap-1 px-3 py-1 text-sm rounded-full"
                    style={{
                      backgroundColor: tag.color + '20',
                      color: tag.color
                    }}
                  >
                    <FiTag className="w-3 h-3" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

            {/* Content */}
            <div className="mt-6">
              {renderContent(note.content, note.contentType)}
            </div>
          </div>
        </article>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 mb-4">
            Want to create and share your own notes?
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Get Started for Free
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedNote;
