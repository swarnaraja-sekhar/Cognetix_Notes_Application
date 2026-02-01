/**
 * API Service
 * Configures Axios instance with interceptors for JWT authentication
 */

import axios from 'axios';

// API Base URL - adjust for production
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// ============================================
// REQUEST INTERCEPTOR
// ============================================

/**
 * Automatically attach JWT token to all requests
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// RESPONSE INTERCEPTOR
// ============================================

/**
 * Handle responses and errors globally
 */
api.interceptors.response.use(
  (response) => {
    // Return successful response data
    return response;
  },
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Forbidden - user doesn't have permission
          console.error('Access forbidden:', data.message);
          break;
          
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
          
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
          
        default:
          console.error('API error:', data.message);
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('Network error - no response received');
    } else {
      // Error in request configuration
      console.error('Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API FUNCTIONS
// ============================================

export const authAPI = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   */
  register: (userData) => api.post('/auth/register', userData),
  
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  login: (credentials) => api.post('/auth/login', credentials),
  
  /**
   * Get current user profile
   */
  getProfile: () => api.get('/auth/me'),
  
  /**
   * Update user profile
   * @param {Object} data - { name, email }
   */
  updateProfile: (data) => api.put('/auth/me', data),
  
  /**
   * Change password
   * @param {Object} data - { currentPassword, newPassword }
   */
  changePassword: (data) => api.put('/auth/password', data),
};

// ============================================
// NOTES API FUNCTIONS
// ============================================

export const notesAPI = {
  /**
   * Get all notes for the authenticated user
   * @param {Object} params - { page, limit, search, sortBy, sortOrder }
   */
  getAll: (params = {}) => api.get('/notes', { params }),
  
  /**
   * Get a single note by ID
   * @param {string} id - Note ID
   */
  getById: (id) => api.get(`/notes/${id}`),
  
  /**
   * Create a new note
   * @param {Object} noteData - { title, content, isPinned, color, tags, folder, contentType }
   */
  create: (noteData) => api.post('/notes', noteData),
  
  /**
   * Update a note
   * @param {string} id - Note ID
   * @param {Object} noteData - { title, content, isPinned, color, tags, folder, contentType }
   */
  update: (id, noteData) => api.put(`/notes/${id}`, noteData),
  
  /**
   * Delete a note (soft delete by default)
   * @param {string} id - Note ID
   * @param {boolean} permanent - Permanently delete if true
   */
  delete: (id, permanent = false) => api.delete(`/notes/${id}`, { params: { permanent } }),
  
  /**
   * Toggle pin status of a note
   * @param {string} id - Note ID
   */
  togglePin: (id) => api.patch(`/notes/${id}/pin`),
  
  /**
   * Toggle favorite status of a note
   * @param {string} id - Note ID
   */
  toggleFavorite: (id) => api.patch(`/notes/${id}/favorite`),
  
  /**
   * Archive/unarchive a note
   * @param {string} id - Note ID
   */
  archive: (id) => api.put(`/notes/${id}/archive`),
  
  /**
   * Restore a note from trash
   * @param {string} id - Note ID
   */
  restore: (id) => api.put(`/notes/${id}/restore`),
  
  /**
   * Duplicate a note
   * @param {string} id - Note ID
   */
  duplicate: (id) => api.post(`/notes/${id}/duplicate`),
  
  /**
   * Search notes
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   */
  search: (query, filters = {}) => api.get('/notes/search', { params: { q: query, ...filters } }),
  
  /**
   * Get trashed notes
   */
  getTrashed: () => api.get('/notes/trash'),
  
  /**
   * Empty trash
   */
  emptyTrash: () => api.delete('/notes/trash'),
  
  /**
   * Get archived notes
   */
  getArchived: () => api.get('/notes/archive'),
};

// ============================================
// TAGS API FUNCTIONS
// ============================================

export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (tagData) => api.post('/tags', tagData),
  update: (id, tagData) => api.put(`/tags/${id}`, tagData),
  delete: (id) => api.delete(`/tags/${id}`),
  getNotes: (id, params = {}) => api.get(`/tags/${id}/notes`, { params }),
};

// ============================================
// FOLDERS API FUNCTIONS
// ============================================

export const foldersAPI = {
  getAll: () => api.get('/folders'),
  getTree: () => api.get('/folders/tree'),
  create: (folderData) => api.post('/folders', folderData),
  update: (id, folderData) => api.put(`/folders/${id}`, folderData),
  delete: (id, moveNotesTo = null) => api.delete(`/folders/${id}`, { params: { moveNotesTo } }),
  getNotes: (id, params = {}) => api.get(`/folders/${id}/notes`, { params }),
  reorder: (folders) => api.put('/folders/reorder', { folders }),
};

// ============================================
// TEMPLATES API FUNCTIONS
// ============================================

export const templatesAPI = {
  getAll: (params = {}) => api.get('/templates', { params }),
  getById: (id) => api.get(`/templates/${id}`),
  create: (templateData) => api.post('/templates', templateData),
  update: (id, templateData) => api.put(`/templates/${id}`, templateData),
  delete: (id) => api.delete(`/templates/${id}`),
  use: (id, variableValues = {}) => api.post(`/templates/${id}/use`, { variableValues }),
  duplicate: (id) => api.post(`/templates/${id}/duplicate`),
  getCategories: () => api.get('/templates/categories'),
};

// ============================================
// SHARE API FUNCTIONS
// ============================================

export const shareAPI = {
  shareNote: (noteId, email, permission = 'read', expiresAt = null) =>
    api.post('/share', { noteId, email, permission, expiresAt }),
  generateLink: (noteId, expiresAt = null) =>
    api.post('/share/link', { noteId, expiresAt }),
  getSharedByToken: (token) => api.get(`/share/public/${token}`),
  getSharedWithMe: () => api.get('/share/with-me'),
  getSharedByMe: () => api.get('/share/by-me'),
  getNoteShareSettings: (noteId) => api.get(`/share/note/${noteId}`),
  updateShare: (id, data) => api.put(`/share/${id}`, data),
  removeShare: (id) => api.delete(`/share/${id}`),
};

// ============================================
// REMINDERS API FUNCTIONS
// ============================================

export const remindersAPI = {
  getAll: (params = {}) => api.get('/reminders', { params }),
  getUpcoming: () => api.get('/reminders/upcoming'),
  create: (reminderData) => api.post('/reminders', reminderData),
  update: (id, reminderData) => api.put(`/reminders/${id}`, reminderData),
  delete: (id) => api.delete(`/reminders/${id}`),
  complete: (id) => api.put(`/reminders/${id}/complete`),
  snooze: (id, snoozeMinutes = 15) => api.put(`/reminders/${id}/snooze`, { snoozeMinutes }),
  getByNote: (noteId) => api.get(`/reminders/note/${noteId}`),
};

// ============================================
// PROFILE API FUNCTIONS
// ============================================

export const profileAPI = {
  get: () => api.get('/profile'),
  update: (data) => api.put('/profile', data),
  updatePreferences: (preferences) => api.put('/profile/preferences', preferences),
  changePassword: (data) => api.put('/profile/password', data),
  deleteAccount: (password) => api.delete('/profile', { data: { password } }),
  getStats: () => api.get('/profile/stats'),
  exportData: () => api.get('/profile/export'),
};

// Export default api instance for custom requests
export default api;
