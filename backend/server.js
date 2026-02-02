/**
 * Server Entry Point - Enhanced
 * Notes Application Backend with JWT Authentication and Advanced Features
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const tagRoutes = require('./routes/tagRoutes');
const folderRoutes = require('./routes/folderRoutes');
const templateRoutes = require('./routes/templateRoutes');
const shareRoutes = require('./routes/shareRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const profileRoutes = require('./routes/profileRoutes');

// Import middleware
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS for frontend communication
app.use(cors({
   origin: ['http://localhost:5173', 'http://localhost:3000', 'https://cognetix-notes-application.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notes API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Notes routes (protected)
app.use('/api/notes', noteRoutes);

// Tags routes (protected)
app.use('/api/tags', tagRoutes);

// Folders routes (protected)
app.use('/api/folders', folderRoutes);

// Templates routes (protected)
app.use('/api/templates', templateRoutes);

// Share routes (mixed - some public, some protected)
app.use('/api/share', shareRoutes);

// Reminders routes (protected)
app.use('/api/reminders', reminderRoutes);

// Profile routes (protected)
app.use('/api/profile', profileRoutes);

// ============================================
// ERROR HANDLING
// ============================================

// 404 Handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ============================================
  🚀 Server running on port ${PORT}
  📝 Notes API: http://localhost:${PORT}/api
  🏥 Health: http://localhost:${PORT}/api/health
  🌍 Environment: ${process.env.NODE_ENV || 'development'}
  ============================================
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});
