/**
 * Dashboard Page - Professional Design
 * Modern, clean UI with statistics and advanced features
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { notesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import NoteCard from '../components/NoteCard';
import ConfirmModal from '../components/ConfirmModal';
import { 
  HiOutlinePlus, 
  HiOutlineSearch,
  HiOutlineRefresh,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiOutlineDocumentText,
  HiOutlineStar,
  HiOutlineClock,
  HiOutlineFilter,
  HiOutlineX,
  HiOutlineSparkles,
  HiOutlineLightBulb
} from 'react-icons/hi';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  
  // State
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [filterColor, setFilterColor] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, noteId: null });

  // Color options for filter
  const colorOptions = [
    { value: '', label: 'All Colors', color: 'bg-gray-200' },
    { value: '#ffffff', label: 'White', color: 'bg-white border' },
    { value: '#fef3c7', label: 'Yellow', color: 'bg-yellow-200' },
    { value: '#dbeafe', label: 'Blue', color: 'bg-blue-200' },
    { value: '#dcfce7', label: 'Green', color: 'bg-green-200' },
    { value: '#fce7f3', label: 'Pink', color: 'bg-pink-200' },
    { value: '#fed7aa', label: 'Orange', color: 'bg-orange-200' },
    { value: '#e0e7ff', label: 'Indigo', color: 'bg-indigo-200' },
    { value: '#f3e8ff', label: 'Purple', color: 'bg-purple-200' },
  ];

  // Fetch notes
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await notesAPI.getAll({ sortBy, color: filterColor });
      setNotes(response.data.notes || []);
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError(err.response?.data?.message || 'Failed to load notes');
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [sortBy, filterColor]);

  // Load notes on mount and when filters change
  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Calculate statistics
  const stats = {
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    favorites: notes.filter(n => n.isFavorite).length,
    recent: notes.filter(n => {
      const date = new Date(n.updatedAt);
      const now = new Date();
      return (now - date) < 86400000 * 7;
    }).length
  };

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchNotes();
      return;
    }

    try {
      setLoading(true);
      const response = await notesAPI.search(searchQuery);
      setNotes(response.data.notes || []);
    } catch (err) {
      console.error('Search error:', err);
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchNotes();
  };

  // Handle delete
  const handleDelete = async (noteId) => {
    try {
      await notesAPI.delete(noteId);
      setNotes(prev => prev.filter(note => note._id !== noteId));
      toast.success('Note moved to trash');
      setDeleteModal({ isOpen: false, noteId: null });
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete note');
    }
  };

  // Handle toggle pin
  const handleTogglePin = async (noteId) => {
    try {
      const response = await notesAPI.togglePin(noteId);
      setNotes(prev => prev.map(note => 
        note._id === noteId ? response.data.note : note
      ).sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      }));
      toast.success(response.data.message);
    } catch (err) {
      console.error('Toggle pin error:', err);
      toast.error('Failed to update pin status');
    }
  };

  // Filter notes
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current date
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-dark-bg dark:via-dark-bg dark:to-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-indigo-600 rounded-3xl p-8 mb-8 shadow-xl">
          <div className="absolute inset-0 bg-grid-white/10" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="text-white">
              <p className="text-primary-100 text-sm font-medium mb-1">{getCurrentDate()}</p>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {getGreeting()}, {user?.name?.split(' ')[0]}! ✨
              </h1>
              <p className="text-primary-100 text-lg">
                {notes.length === 0 
                  ? "Ready to capture your first brilliant idea?"
                  : `You have ${stats.total} notes. Keep up the great work!`
                }
              </p>
            </div>
            
            <Link 
              to="/notes/new" 
              className="inline-flex items-center justify-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <HiOutlinePlus className="w-5 h-5" />
              <span>Create Note</span>
            </Link>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-1/2 -mb-8 w-32 h-32 bg-indigo-400/20 rounded-full blur-3xl" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm border-2 border-gray-200 dark:border-dark-border hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">Total Notes</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                <HiOutlineDocumentText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm border-2 border-gray-200 dark:border-dark-border hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">Pinned</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.pinned}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <HiOutlineStar className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm border-2 border-gray-200 dark:border-dark-border hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">Favorites</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.favorites}</p>
              </div>
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center">
                <HiOutlineSparkles className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-dark-card rounded-2xl p-5 shadow-sm border-2 border-gray-200 dark:border-dark-border hover:shadow-md hover:border-gray-300 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-dark-muted font-medium">This Week</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.recent}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                <HiOutlineClock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="bg-white dark:bg-dark-card rounded-2xl p-4 shadow-sm border-2 border-gray-200 dark:border-dark-border mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search your notes..."
                className="w-full pl-12 pr-24 py-3 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-20 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-dark-border rounded-full transition-colors"
                >
                  <HiOutlineX className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded-lg font-medium transition-colors"
              >
                Search
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
                  showFilters || filterColor
                    ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/30 dark:border-primary-700 dark:text-primary-300'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 dark:bg-dark-bg dark:border-dark-border dark:text-dark-muted'
                }`}
              >
                <HiOutlineFilter className="w-5 h-5" />
                <span className="hidden sm:inline">Filters</span>
                {filterColor && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
              </button>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-600 dark:text-dark-muted focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
              >
                <option value="updatedAt">Recently Updated</option>
                <option value="createdAt">Recently Created</option>
                <option value="title">Alphabetical</option>
              </select>

              {/* Refresh */}
              <button
                onClick={fetchNotes}
                className="p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-600 dark:text-dark-muted hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                title="Refresh"
              >
                <HiOutlineRefresh className="w-5 h-5" />
              </button>
              
              {/* View Mode */}
              <div className="flex items-center bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid' 
                      ? 'bg-white dark:bg-dark-card shadow-sm text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid view"
                >
                  <HiOutlineViewGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list' 
                      ? 'bg-white dark:bg-dark-card shadow-sm text-primary-600' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List view"
                >
                  <HiOutlineViewList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Filter by color</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterColor(option.value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
                      filterColor === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded-full ${option.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-300">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 dark:text-dark-muted">Loading your notes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiOutlineX className="w-10 h-10 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
            <p className="text-gray-500 dark:text-dark-muted mb-6">{error}</p>
            <button onClick={fetchNotes} className="btn-primary">
              Try Again
            </button>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-indigo-100 dark:from-primary-900/30 dark:to-indigo-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              {searchQuery ? (
                <HiOutlineSearch className="w-12 h-12 text-primary-500" />
              ) : (
                <HiOutlineLightBulb className="w-12 h-12 text-primary-500" />
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No notes found' : 'Start your journey'}
            </h3>
            <p className="text-gray-500 dark:text-dark-muted mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `No notes match "${searchQuery}". Try a different search term.`
                : "Your creative space awaits! Create your first note and begin capturing your thoughts, ideas, and inspirations."
              }
            </p>
            {!searchQuery && (
              <Link 
                to="/notes/new" 
                className="inline-flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <HiOutlinePlus className="w-5 h-5" />
                <span>Create Your First Note</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Notes count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-dark-muted">
                Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{filteredNotes.length}</span> {filteredNotes.length === 1 ? 'note' : 'notes'}
                {searchQuery && <span> for "<span className="font-semibold">{searchQuery}</span>"</span>}
              </p>
            </div>
            
            {/* Notes Grid/List */}
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                : 'space-y-4'
            }>
              {filteredNotes.map((note, index) => (
                <div 
                  key={note._id} 
                  className={`${viewMode === 'list' ? 'max-w-4xl' : ''} animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <NoteCard
                    note={note}
                    onDelete={() => setDeleteModal({ isOpen: true, noteId: note._id })}
                    onTogglePin={handleTogglePin}
                    viewMode={viewMode}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Quick Actions FAB */}
        <div className="fixed bottom-8 right-8 z-50 lg:hidden">
          <Link 
            to="/notes/new" 
            className="flex items-center justify-center w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200"
          >
            <HiOutlinePlus className="w-7 h-7" />
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, noteId: null })}
        onConfirm={() => handleDelete(deleteModal.noteId)}
        title="Move to Trash?"
        message="This note will be moved to trash. You can restore it within 30 days."
        confirmText="Move to Trash"
        type="danger"
      />
    </div>
  );
};

export default Dashboard;
