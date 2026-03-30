const express = require('express');
const router = express.Router();
const Market = require('../models/Market');

// Seed static market data using upsert to avoid race conditions
const seedMarketData = async () => {
    const seeds = [
        { symbol: 'BTC/USD', name: 'Bitcoin',  price: 40000, change24h: 2.5,  volume24h: 1200000000, high24h: 41000, low24h: 39000 },
        { symbol: 'ETH/USD', name: 'Ethereum', price: 2500,  change24h: 1.8,  volume24h:  600000000, high24h:  2600, low24h:  2400 },
        { symbol: 'LTC/USD', name: 'Litecoin', price:  150,  change24h: -0.5, volume24h:   80000000, high24h:   155, low24h:   145 },
        { symbol: 'XRP/USD', name: 'Ripple',   price:    1,  change24h: 3.2,  volume24h:  200000000, high24h:     1.05, low24h: 0.95 }
    ];
    await Promise.all(seeds.map(seed =>
        Market.updateOne({ symbol: seed.symbol }, { $setOnInsert: seed }, { upsert: true })
    ));
};

// GET /api/v1/market/data – full market data
router.get('/data', async (req, res) => {
    try {
        await seedMarketData();
        const data = await Market.find().sort({ symbol: 1 });
        return res.status(200).json({ data });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to retrieve market data.', error: err.message });
    }
});

// GET /api/v1/market/tickers – lightweight symbol/price tickers
router.get('/tickers', async (req, res) => {
    try {
        await seedMarketData();
        const tickers = await Market.find({}, 'symbol name price change24h').sort({ symbol: 1 });
        return res.status(200).json({ tickers });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to retrieve tickers.', error: err.message });
    }
});

module.exports = router;