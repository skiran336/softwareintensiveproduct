require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('../config/db');

// Route imports
const productRoutes = require('../routes/productRoutes');
const userRoutes = require('../routes/userRoutes');

// Initialize Express app
const app = express();

// ======================
//      Middleware
// ======================

// Static files
app.use(express.static('public'));

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
process.env.NODE_ENV !== 'production' && app.use(morgan('dev'));

// ======================
//   Database Connection
// ======================
connectDB();

// ======================
//       Routes
// ======================
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ======================
//  Error Handling
// ======================
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && {
      message: err.message,
      stack: err.stack
    })
  });
});

// Export Express app
module.exports = app;