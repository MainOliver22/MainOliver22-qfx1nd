require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const walletRoutes = require('./routes/wallet');
const tradeRoutes = require('./routes/trade');
const transactionRoutes = require('./routes/transactions');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found.' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.', error: err.message });
});

// Connect to MongoDB and start server
mongoose
    .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-exchange')
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    });

module.exports = app;
