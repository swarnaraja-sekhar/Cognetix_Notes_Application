/**
 * Navbar Component - Enhanced
 * Main navigation bar with authentication status and dark mode toggle
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HiOutlineMenu, 
  HiOutlineX, 
  HiOutlineLogout,
  HiOutlinePlus,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineUser,
  HiOutlineDocumentText,
  HiOutlineTrash,
  HiOutlineArchive,
  HiOutlineCog
} from 'react-icons/hi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem('darkMode') === 'true' || false
  );

  // Toggle mobile menu
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode.toString());
    
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  // Check if link is active
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-dark-card shadow-sm border-b border-gray-200 dark:border-dark-border sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={isAuthenticated ? '/dashboard' : '/'} 
            className="flex items-center space-x-2 group"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <HiOutlineDocumentText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Note
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* Dashboard Link */}
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border'
                  }`}
                >
                  My Notes
                </Link>

                {/* Archive Link */}
                <Link
                  to="/archive"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive('/archive')
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border'
                  }`}
                >
                  <HiOutlineArchive className="w-4 h-4" />
                  Archive
                </Link>

                {/* Trash Link */}
                <Link
                  to="/trash"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                    isActive('/trash')
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border'
                  }`}
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  Trash
                </Link>

                {/* Create Note Button */}
                <Link
                  to="/notes/new"
                  className="btn-primary btn-sm flex items-center space-x-1"
                >
                  <HiOutlinePlus className="w-4 h-4" />
                  <span>New Note</span>
                </Link>

                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <HiOutlineSun className="w-5 h-5" />
                  ) : (
                    <HiOutlineMoon className="w-5 h-5" />
                  )}
                </button>

                {/* User Menu */}
                <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-dark-border">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                      <HiOutlineUser className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-dark-text">
                      {user?.name}
                    </span>
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
                    aria-label="Settings"
                  >
                    <HiOutlineCog className="w-5 h-5" />
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 dark:text-dark-muted dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                    aria-label="Logout"
                  >
                    <HiOutlineLogout className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Dark Mode Toggle */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border transition-colors"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? (
                    <HiOutlineSun className="w-5 h-5" />
                  ) : (
                    <HiOutlineMoon className="w-5 h-5" />
                  )}
                </button>

                {/* Auth Links */}
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/login')
                      ? 'bg-gray-100 text-gray-900 dark:bg-dark-border dark:text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border'
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn-primary btn-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border"
            >
              {isDarkMode ? (
                <HiOutlineSun className="w-5 h-5" />
              ) : (
                <HiOutlineMoon className="w-5 h-5" />
              )}
            </button>
            
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-dark-muted dark:hover:bg-dark-border"
            >
              {isMenuOpen ? (
                <HiOutlineX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-dark-border animate-slide-down">
            {isAuthenticated ? (
              <div className="space-y-2">
                {/* User Info */}
                <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 dark:bg-dark-bg rounded-lg mb-4">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <HiOutlineUser className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-dark-muted">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-border"
                >
                  My Notes
                </Link>
                
                <Link
                  to="/notes/new"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-border"
                >
                  Create Note
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-dark-text dark:hover:bg-dark-border"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-2 rounded-lg bg-primary-600 text-white text-center"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
