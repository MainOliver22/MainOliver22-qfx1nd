const express = require('express');
const router = express.Router();

// Sample data for the example endpoints
const pricesData = [{ symbol: 'BTC/USD', price: 40000 }, { symbol: 'ETH/USD', price: 2500 }];
const chartsData = [{ symbol: 'BTC/USD', chart: [] }, { symbol: 'ETH/USD', chart: [] }];
const orderBooksData = [{ symbol: 'BTC/USD', orders: [] }, { symbol: 'ETH/USD', orders: [] }];
const tradesData = [{ symbol: 'BTC/USD', trades: [] }, { symbol: 'ETH/USD', trades: [] }];

// GET endpoint for prices
router.get('/prices', (req, res) => {
    res.json(pricesData);
});

// GET endpoint for charts
router.get('/charts', (req, res) => {
    res.json(chartsData);
});

// GET endpoint for order books
router.get('/order-books', (req, res) => {
    res.json(orderBooksData);
});

// GET endpoint for trades
router.get('/trades', (req, res) => {
    res.json(tradesData);
});

module.exports = router;