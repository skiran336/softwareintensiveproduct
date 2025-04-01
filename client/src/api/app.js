require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('../config/db'); // Single required declaration

const app = express();

// ======================
//   Database Connection
// ======================
// Initialize database connection
connectDB().catch(error => {
  console.error('Database Connection Failed:', error);
  process.exit(1);
});

// Serverless-specific optimization
if (process.env.NODE_ENV === 'production') {
  mongoose.connection.on('connected', () => {
    console.log('Database connected - serverless mode');
  });
}

// ======================
//      Middleware
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

process.env.NODE_ENV !== 'production' && app.use(morgan('dev'));

// ======================
//       Routes
// ======================
const router = express.Router();
app.use('/api', router);

// Health Check with connection verification
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    dbState: mongoose.STATES[mongoose.connection.readyState],
    environment: process.env.NODE_ENV
  });
});

// Route imports
const productRoutes = require('../routes/productRoutes');
const userRoutes = require('../routes/userRoutes');
router.use('/products', productRoutes);
router.use('/users', userRoutes);

// ======================
//  Error Handling
// ======================
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ERROR:`, err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && {
      stack: err.stack
    })
  });
});

module.exports = app;