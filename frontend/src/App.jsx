/**
 * App Component - Enhanced
 * Main application with routing configuration and advanced features
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useEffect } from 'react';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateNote from './pages/CreateNote';
import EditNote from './pages/EditNote';
import NoteDetails from './pages/NoteDetails';
import Trash from './pages/Trash';
import Archive from './pages/Archive';
import Profile from './pages/Profile';
import SharedNote from './pages/SharedNote';

// Initialize dark mode from localStorage
const initializeDarkMode = () => {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
  }
};

function App() {
  // Initialize dark mode on app load
  useEffect(() => {
    initializeDarkMode();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
          {/* Navigation */}
          <Navbar />
          
          {/* Main Content */}
          <main>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/shared/:token" element={<SharedNote />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notes/new" 
                element={
                  <ProtectedRoute>
                    <CreateNote />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notes/:id" 
                element={
                  <ProtectedRoute>
                    <NoteDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notes/:id/edit" 
                element={
                  <ProtectedRoute>
                    <EditNote />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/trash" 
                element={
                  <ProtectedRoute>
                    <Trash />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/archive" 
                element={
                  <ProtectedRoute>
                    <Archive />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch all - redirect to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Toast Notifications */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#10b981',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#10b981',
                },
              },
              error: {
                style: {
                  background: '#ef4444',
                },
                iconTheme: {
                  primary: '#fff',
                  secondary: '#ef4444',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
