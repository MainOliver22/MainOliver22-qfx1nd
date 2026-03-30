const express = require('express');
const router = express.Router();
const MarketData = require('../models/marketData');
const { apiLimiter } = require('../middleware/rateLimiters');

// Seed default market data if collection is empty
const defaultMarketData = [
    { symbol: 'BTC', name: 'Bitcoin', price: 45000, change24h: 2.5, volume24h: 28000000000, marketCap: 850000000000 },
    { symbol: 'ETH', name: 'Ethereum', price: 2800, change24h: 1.8, volume24h: 15000000000, marketCap: 330000000000 },
    { symbol: 'BNB', name: 'Binance Coin', price: 320, change24h: -0.5, volume24h: 1500000000, marketCap: 49000000000 },
    { symbol: 'SOL', name: 'Solana', price: 110, change24h: 3.2, volume24h: 3000000000, marketCap: 47000000000 },
    { symbol: 'ADA', name: 'Cardano', price: 0.55, change24h: -1.2, volume24h: 500000000, marketCap: 19000000000 }
];

async function ensureMarketData() {
    const count = await MarketData.countDocuments();
    if (count === 0) {
        await MarketData.insertMany(defaultMarketData);
    }
}

// GET /api/market/data
router.get('/data', apiLimiter, async (req, res) => {
    try {
        await ensureMarketData();
        const data = await MarketData.find({}, '-__v');
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/market/tickers
router.get('/tickers', apiLimiter, async (req, res) => {
    try {
        await ensureMarketData();
        const { symbols } = req.query;
        let query = {};
        if (symbols) {
            const symbolList = symbols.toUpperCase().split(',').map(s => s.trim());
            query = { symbol: { $in: symbolList } };
        }
        const tickers = await MarketData.find(query, 'symbol name price change24h -_id');
        res.json(tickers);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/market/ticker/:symbol
router.get('/ticker/:symbol', apiLimiter, async (req, res) => {
    try {
        await ensureMarketData();
        const symbol = req.params.symbol.toUpperCase();
        const ticker = await MarketData.findOne({ symbol }, '-__v');
        if (!ticker) {
            return res.status(404).json({ message: `Ticker ${symbol} not found.` });
        }
        res.json(ticker);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;
