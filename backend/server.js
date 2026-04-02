require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { apiLimiter: globalLimiter, authLimiter } = require('./middleware/rateLimiters');

const authRoutes = require('./routes/auth');
const marketRoutes = require('./routes/market');
const walletRoutes = require('./routes/wallet');
const tradeRoutes = require('./routes/trade');
const transactionRoutes = require('./routes/transactions');

const app = express();
const port = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Request logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Core middleware
app.use(cors());
app.use(express.json());

// Rate limiting
app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found.` });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;
