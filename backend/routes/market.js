const express = require('express');
const router = express.Router();
const MarketData = require('../models/MarketData');

const defaultMarketData = [
    { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change24h: 2.34, volume24h: 28900000000, marketCap: 847000000000 },
    { symbol: 'ETH', name: 'Ethereum', price: 2680.50, change24h: 1.87, volume24h: 15200000000, marketCap: 322000000000 },
    { symbol: 'LTC', name: 'Litecoin', price: 72.30, change24h: -0.45, volume24h: 520000000, marketCap: 5200000000 },
    { symbol: 'XRP', name: 'Ripple', price: 0.6120, change24h: 3.21, volume24h: 2100000000, marketCap: 33000000000 },
    { symbol: 'ADA', name: 'Cardano', price: 0.3850, change24h: -1.12, volume24h: 890000000, marketCap: 13600000000 }
];

const seedMarketData = async () => {
    try {
        const count = await MarketData.countDocuments();
        if (count === 0) {
            await MarketData.insertMany(defaultMarketData);
        }
    } catch (err) {
        console.error('Market data seed error:', err);
    }
};

// Seed on module load (intentionally fire-and-forget; routes handle DB errors gracefully)
seedMarketData();

// GET /api/market/data - Retrieve current market data from DB
router.get('/data', async (req, res) => {
    try {
        const data = await MarketData.find().sort({ symbol: 1 });
        res.json({ success: true, data });
    } catch (err) {
        console.error('Market data error:', err);
        res.status(500).json({ message: 'Server error retrieving market data.' });
    }
});

// GET /api/market/tickers - Get ticker information from DB
router.get('/tickers', async (req, res) => {
    try {
        const data = await MarketData.find().sort({ symbol: 1 });
        const tickers = data.map(coin => ({
            symbol: `${coin.symbol}/USD`,
            last: coin.price,
            change: coin.change24h,
            volume: coin.volume24h,
            lastUpdated: coin.updatedAt
        }));
        res.json({ success: true, tickers });
    } catch (err) {
        console.error('Tickers error:', err);
        res.status(500).json({ message: 'Server error retrieving tickers.' });
    }
});

// GET /api/market/ticker/:symbol - Get single ticker from DB
router.get('/ticker/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol.toUpperCase();
        const coin = await MarketData.findOne({ symbol });
        if (!coin) {
            return res.status(404).json({ message: `Symbol ${symbol} not found.` });
        }
        res.json({ success: true, data: coin });
    } catch (err) {
        console.error('Ticker error:', err);
        res.status(500).json({ message: 'Server error retrieving ticker.' });
    }
});

// GET /api/market/prices - Retrieve current prices (legacy)
router.get('/prices', async (req, res) => {
    try {
        const data = await MarketData.find().sort({ symbol: 1 });
        const prices = data.map(coin => ({ symbol: `${coin.symbol}/USD`, price: coin.price }));
        res.json(prices);
    } catch (err) {
        console.error('Prices error:', err);
        res.status(500).json({ message: 'Server error retrieving prices.' });
    }
});

// GET /api/market/charts - Chart placeholder data
router.get('/charts', async (req, res) => {
    try {
        const data = await MarketData.find().sort({ symbol: 1 });
        const charts = data.map(coin => ({ symbol: `${coin.symbol}/USD`, chart: [] }));
        res.json(charts);
    } catch (err) {
        console.error('Charts error:', err);
        res.status(500).json({ message: 'Server error retrieving charts.' });
    }
});

// GET /api/market/order-books - Order book placeholder
router.get('/order-books', async (req, res) => {
    try {
        const data = await MarketData.find().sort({ symbol: 1 });
        const books = data.map(coin => ({ symbol: `${coin.symbol}/USD`, orders: [] }));
        res.json(books);
    } catch (err) {
        console.error('Order books error:', err);
        res.status(500).json({ message: 'Server error retrieving order books.' });
    }
});

// GET /api/market/trades - Recent trades placeholder
router.get('/trades', async (req, res) => {
    try {
        const data = await MarketData.find().sort({ symbol: 1 });
        const trades = data.map(coin => ({ symbol: `${coin.symbol}/USD`, trades: [] }));
        res.json(trades);
    } catch (err) {
        console.error('Trades error:', err);
        res.status(500).json({ message: 'Server error retrieving trades.' });
    }
});

module.exports = router;