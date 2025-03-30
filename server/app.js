require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const connectDB = require('./config/db');
const productRoutes = require('./routes/productRoutes');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(cors({
    origin: 'http://localhost:4000', // Or your frontend origin
    methods: ['GET', 'POST']
  }));
app.use(express.json());
app.use(morgan('dev'));

// Database
connectDB();

// Routes
app.use('/api/products', productRoutes);
// In your Express.js route
const axios = require('axios');




// Error handling

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});