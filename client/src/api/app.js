require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('../config/db');

// Initialize Express first
const app = express();

// ======================
//    Critical Middleware
// ======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ======================
//   Database Connection
// ======================
if (process.env.NODE_ENV !== 'production') {
  // Local development connection
  connectDB();
} else {
  // Serverless-compatible connection
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    bufferCommands: false, // Disable command buffering
    bufferMaxEntries: 0 // Disable connection pooling
  }).catch(error => {
    console.error('Serverless DB Connection Error:', error);
  });
}

// ======================
//    Additional Middleware
// ======================
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
app.use('/api', router); // Base API route

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    dbState: mongoose.connection.readyState,
    environment: process.env.NODE_ENV
  });
});

// Your existing routes
const productRoutes = require('../routes/productRoutes');
const userRoutes = require('../routes/userRoutes');
router.use('/products', productRoutes);
router.use('/users', userRoutes);

// ======================
//  Error Handling
// ======================
app.use((err, req, res, next) => {
  console.error(`[ERROR ${new Date().toISOString()}]`, err);
  res.status(500).json({
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && {
      message: err.message,
      stack: err.stack
    })
  });
});

module.exports = app;