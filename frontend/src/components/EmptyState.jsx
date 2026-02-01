/**
 * Empty State Component
 * Displays a message when no data is available
 */

import { Link } from 'react-router-dom';
import { HiOutlineDocumentAdd, HiOutlineSearch } from 'react-icons/hi';

const EmptyState = ({ 
  title = 'No notes yet',
  description = 'Create your first note to get started',
  icon = 'document',
  actionText = 'Create Note',
  actionLink = '/notes/new',
  showAction = true
}) => {
  const icons = {
    document: HiOutlineDocumentAdd,
    search: HiOutlineSearch
  };

  const Icon = icons[icon] || icons.document;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 bg-gray-100 dark:bg-dark-card rounded-full flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-gray-400 dark:text-dark-muted" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 dark:text-dark-muted text-center max-w-sm mb-6">
        {description}
      </p>
      
      {showAction && actionLink && (
        <Link to={actionLink} className="btn-primary">
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
