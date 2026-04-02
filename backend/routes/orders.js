const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

// Apply rate limiting and auth to all order routes
router.use(apiLimiter);
router.use(verifyToken);

// POST /api/orders/place - Place an order
router.post('/place', async (req, res) => {
    try {
        const { type, symbol, amount, price } = req.body;
        if (!type || !symbol || !amount || !price) {
            return res.status(400).json({ message: 'type, symbol, amount, and price are required.' });
        }
        if (!['buy', 'sell'].includes(type)) {
            return res.status(400).json({ message: 'type must be buy or sell.' });
        }
        if (amount <= 0 || price <= 0) {
            return res.status(400).json({ message: 'amount and price must be greater than zero.' });
        }

        const total = parseFloat((amount * price).toFixed(2));
        const order = new Order({
            userId: req.user.id,
            type,
            symbol: symbol.toUpperCase(),
            amount,
            price,
            total,
            status: 'filled'
        });
        await order.save();

        res.status(201).json({ success: true, order });
    } catch (err) {
        console.error('Place order error:', err);
        res.status(500).json({ message: 'Server error placing order.' });
    }
});

// GET /api/orders/history - Retrieve user's order history
router.get('/history', async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Order history error:', err);
        res.status(500).json({ message: 'Server error retrieving order history.' });
    }
});

module.exports = router;