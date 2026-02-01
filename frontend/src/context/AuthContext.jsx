/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

// Create context
const AuthContext = createContext(null);

// ============================================
// AUTH PROVIDER COMPONENT
// ============================================

export const AuthProvider = ({ children }) => {
  // State
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ============================================
  // INITIALIZE AUTH STATE
  // ============================================

  /**
   * Check for existing token and user data on app load
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid by fetching profile
          try {
            const response = await authAPI.getProfile();
            setUser(response.data.user);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } catch (err) {
            // Token is invalid - clear auth state
            console.error('Token verification failed:', err);
            logout();
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ============================================
  // AUTH METHODS
  // ============================================

  /**
   * Register a new user
   */
  const register = async (name, email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.register({ name, email, password });
      const { token: newToken, user: userData } = response.data;

      // Store auth data
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await authAPI.login({ email, password });
      const { token: newToken, user: userData } = response.data;

      // Store auth data
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = async (data) => {
    try {
      setError(null);
      
      const response = await authAPI.updateProfile(data);
      const updatedUser = response.data.user;

      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed';
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Clear any auth errors
   */
  const clearError = () => setError(null);

  // ============================================
  // CONTEXT VALUE
  // ============================================

  const value = {
    // State
    user,
    token,
    loading,
    error,
    isAuthenticated: !!token && !!user,
    
    // Methods
    register,
    login,
    logout,
    updateProfile,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// CUSTOM HOOK
// ============================================

/**
 * Hook to use auth context
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;
