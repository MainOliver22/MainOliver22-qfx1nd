const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');
const Order = require('../models/order');

// POST /api/orders/place
router.post('/place', apiLimiter, verifyToken, async (req, res) => {
    const { type, symbol, amount, price } = req.body;
    if (!type || !symbol || !amount || !price) {
        return res.status(400).json({ message: 'type, symbol, amount, and price are required.' });
    }
    try {
        const order = new Order({
            userId: req.user.id,
            type,
            symbol: symbol.toUpperCase(),
            amount: parseFloat(amount),
            price: parseFloat(price),
            total: parseFloat(amount) * parseFloat(price),
            status: 'pending'
        });
        await order.save();
        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/orders/history
router.get('/history', apiLimiter, verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;
