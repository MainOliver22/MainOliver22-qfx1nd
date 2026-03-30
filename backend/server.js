require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 3000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Rate limiting ---
const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again later.' }
});

app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/', defaultLimiter);

// --- Database connection ---
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/crypto_exchange';
mongoose
    .connect(mongoUri)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// --- Routes ---
const authRoutes    = require('./routes/auth');
const marketRoutes  = require('./routes/market');
const walletRoutes  = require('./routes/wallet');
const orderRoutes   = require('./routes/transactions'); // order placement + transaction history
const tradeRoutes   = require('./routes/orders');       // buy/sell execution + trade history

app.use('/api/v1/auth',   authRoutes);
app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/order',  orderRoutes);
app.use('/api/v1/trade',  tradeRoutes);

// --- Health check ---
app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

// --- 404 handler ---
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// --- Global error handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error.', error: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
