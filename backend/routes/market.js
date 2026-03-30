const express = require('express');
const router = express.Router();

// Mock cryptocurrency market data with simulated price variance
const baseMarketData = {
    BTC: { name: 'Bitcoin', symbol: 'BTC', price: 43250.00, change24h: 2.34, volume24h: 28900000000 },
    ETH: { name: 'Ethereum', symbol: 'ETH', price: 2680.50, change24h: 1.87, volume24h: 15200000000 },
    LTC: { name: 'Litecoin', symbol: 'LTC', price: 72.30, change24h: -0.45, volume24h: 520000000 },
    XRP: { name: 'Ripple', symbol: 'XRP', price: 0.6120, change24h: 3.21, volume24h: 2100000000 },
    ADA: { name: 'Cardano', symbol: 'ADA', price: 0.3850, change24h: -1.12, volume24h: 890000000 }
};

const getMarketData = () => {
    return Object.values(baseMarketData).map(coin => ({
        ...coin,
        price: parseFloat((coin.price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2)),
        lastUpdated: new Date().toISOString()
    }));
};

// GET /api/market/data - Retrieve current market prices
router.get('/data', (req, res) => {
    res.json({ success: true, data: getMarketData() });
});

// GET /api/market/tickers - Get ticker information
router.get('/tickers', (req, res) => {
    const tickers = getMarketData().map(coin => ({
        symbol: `${coin.symbol}/USD`,
        last: coin.price,
        change: coin.change24h,
        volume: coin.volume24h,
        lastUpdated: coin.lastUpdated
    }));
    res.json({ success: true, tickers });
});

// GET /api/market/prices - Retrieve current prices (legacy)
router.get('/prices', (req, res) => {
    const prices = getMarketData().map(({ symbol, price }) => ({ symbol: `${symbol}/USD`, price }));
    res.json(prices);
});

// GET /api/market/charts - Chart placeholder data
router.get('/charts', (req, res) => {
    const charts = Object.keys(baseMarketData).map(symbol => ({ symbol: `${symbol}/USD`, chart: [] }));
    res.json(charts);
});

// GET /api/market/order-books - Order book placeholder
router.get('/order-books', (req, res) => {
    const books = Object.keys(baseMarketData).map(symbol => ({ symbol: `${symbol}/USD`, orders: [] }));
    res.json(books);
});

// GET /api/market/trades - Recent trades placeholder
router.get('/trades', (req, res) => {
    const trades = Object.keys(baseMarketData).map(symbol => ({ symbol: `${symbol}/USD`, trades: [] }));
    res.json(trades);
});

module.exports = router;