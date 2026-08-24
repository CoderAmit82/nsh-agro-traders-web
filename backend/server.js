require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const { startCronJob } = require('./utils/cronReminder');

// Initialize Express App
const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware Setups
app.use(cors());
app.use(express.json());

// Create required upload folders on startup
const uploadsDir = path.join(__dirname, 'uploads');
const invoicesDir = path.join(__dirname, 'uploads', 'invoices');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(invoicesDir)) fs.mkdirSync(invoicesDir);

// Serve static uploaded files (product images & PDF invoices)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Route Handlers
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');
const analyticsRoutes = require('./routes/analytics');

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/analytics', analyticsRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NSH Agro Traders API' });
});

// Central Error Handler Middleware (must be after routes)
app.use(errorHandler);

// Initialize Cron Jobs
startCronJob();

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
