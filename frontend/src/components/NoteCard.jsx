/**
 * NoteCard Component - Professional Design
 * Displays a single note in a beautiful card format
 */

import { Link } from 'react-router-dom';
import { 
  HiOutlineTrash, 
  HiOutlinePencil, 
  HiOutlineBookmark,
  HiBookmark,
  HiOutlineClock,
  HiOutlineHeart,
  HiHeart,
  HiOutlineDotsVertical
} from 'react-icons/hi';

const NoteCard = ({ note, onDelete, onTogglePin, viewMode = 'grid' }) => {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      if (hours < 1) {
        const minutes = Math.floor(diff / 60000);
        return minutes <= 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Truncate content for preview
  const truncateContent = (content, maxLength = 120) => {
    if (!content) return '';
    const stripped = content.replace(/[#*`\-\[\]]/g, '').trim();
    if (stripped.length <= maxLength) return stripped;
    return stripped.substring(0, maxLength).trim() + '...';
  };

  // Get background style based on note color
  const getCardStyle = () => {
    if (note.color && note.color !== '#ffffff') {
      return {
        background: `linear-gradient(135deg, ${note.color}20 0%, ${note.color}10 100%)`,
        borderColor: `${note.color}40`
      };
    }
    return {};
  };

  if (viewMode === 'list') {
    return (
      <div 
        className={`group relative bg-white dark:bg-dark-card rounded-xl border-[3px] border-gray-300 dark:border-dark-border p-5 hover:shadow-lg hover:border-gray-400 transition-all duration-300 shadow-md ${
          note.isPinned ? 'ring-2 ring-primary-400/50 border-primary-300' : ''
        }`}
        style={getCardStyle()}
      >
        <div className="flex items-start gap-4">
          {/* Color indicator */}
          {note.color && note.color !== '#ffffff' && (
            <div 
              className="w-1 h-full min-h-[60px] rounded-full flex-shrink-0"
              style={{ backgroundColor: note.color }}
            />
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <Link to={`/notes/${note._id}`} className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {note.title}
                </h3>
                <p className="mt-1 text-gray-500 dark:text-dark-muted text-sm line-clamp-2">
                  {truncateContent(note.content, 200)}
                </p>
              </Link>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onTogglePin(note._id)}
                  className={`p-2 rounded-lg transition-colors ${
                    note.isPinned 
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/30' 
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-border'
                  }`}
                >
                  {note.isPinned ? <HiBookmark className="w-5 h-5" /> : <HiOutlineBookmark className="w-5 h-5" />}
                </button>
                <Link
                  to={`/notes/${note._id}/edit`}
                  className="p-2 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <HiOutlinePencil className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => onDelete(note._id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <HiOutlineTrash className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center text-xs text-gray-400 dark:text-dark-muted">
                <HiOutlineClock className="w-4 h-4 mr-1" />
                {formatDate(note.updatedAt)}
              </span>
              {note.isFavorite && (
                <span className="flex items-center text-xs text-rose-500">
                  <HiHeart className="w-4 h-4 mr-1" />
                  Favorite
                </span>
              )}
              {note.isPinned && (
                <span className="text-xs text-primary-600 dark:text-primary-400 font-medium">
                  📌 Pinned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative bg-white dark:bg-dark-card rounded-2xl border-[3px] border-gray-300 dark:border-dark-border overflow-hidden hover:shadow-xl hover:-translate-y-1 hover:border-gray-400 transition-all duration-300 shadow-md ${
        note.isPinned ? 'ring-2 ring-primary-400/50 border-primary-300' : ''
      }`}
      style={getCardStyle()}
    >
      {/* Pinned Badge */}
      {note.isPinned && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 shadow-sm">
            📌 Pinned
          </span>
        </div>
      )}

      {/* Color Bar */}
      {note.color && note.color !== '#ffffff' && (
        <div 
          className="h-1.5 w-full"
          style={{ backgroundColor: note.color }}
        />
      )}

      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <Link to={`/notes/${note._id}`}>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate hover:text-primary-600 dark:hover:text-primary-400 transition-colors pr-16">
              {note.title}
            </h3>
          </Link>
        </div>

        {/* Content Preview */}
        <Link to={`/notes/${note._id}`} className="block mb-4">
          <p className="text-gray-500 dark:text-dark-muted text-sm leading-relaxed line-clamp-3">
            {truncateContent(note.content)}
          </p>
        </Link>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span 
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-600 dark:bg-dark-border dark:text-gray-300"
                style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : {}}
              >
                {tag.name || tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-400">+{note.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-dark-border">
          {/* Date & Favorite */}
          <div className="flex items-center gap-3">
            <span className="flex items-center text-xs text-gray-400 dark:text-dark-muted">
              <HiOutlineClock className="w-4 h-4 mr-1" />
              {formatDate(note.updatedAt)}
            </span>
            {note.isFavorite && (
              <HiHeart className="w-4 h-4 text-rose-500" />
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onTogglePin(note._id)}
              className={`p-1.5 rounded-lg transition-colors ${
                note.isPinned 
                  ? 'text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-dark-border'
              }`}
              title={note.isPinned ? 'Unpin note' : 'Pin note'}
            >
              {note.isPinned ? <HiBookmark className="w-4 h-4" /> : <HiOutlineBookmark className="w-4 h-4" />}
            </button>
            
            <Link
              to={`/notes/${note._id}/edit`}
              className="p-1.5 rounded-lg text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
              title="Edit note"
            >
              <HiOutlinePencil className="w-4 h-4" />
            </Link>

            <button
              onClick={() => onDelete(note._id)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete note"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoteCard;
