const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { apiLimiter, tradingLimiter } = require('../middleware/rateLimiters');
const User = require('../models/user');
const Order = require('../models/order');
const MarketData = require('../models/marketData');

// POST /api/trade/buy
router.post(
    '/buy',
    tradingLimiter,
    verifyToken,
    [
        body('symbol').trim().notEmpty().withMessage('Symbol is required'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { symbol, amount } = req.body;
        const symbolUpper = symbol.toUpperCase();
        const buyAmount = parseFloat(amount);

        try {
            const marketEntry = await MarketData.findOne({ symbol: symbolUpper });
            if (!marketEntry) {
                return res.status(404).json({ message: `Symbol ${symbolUpper} not found.` });
            }

            const price = marketEntry.price;
            const total = price * buyAmount;

            // Atomically deduct USD balance if sufficient
            const deducted = await User.findOneAndUpdate(
                {
                    _id: req.user.id,
                    wallet: { $elemMatch: { currency: 'USD', balance: { $gte: total } } }
                },
                { $inc: { 'wallet.$.balance': -total } },
                { new: true }
            );

            if (!deducted) {
                return res.status(400).json({ message: 'Insufficient USD balance.' });
            }

            // Atomically add the crypto to wallet
            const hasCrypto = deducted.wallet.some(w => w.currency === symbolUpper);
            if (hasCrypto) {
                await User.findOneAndUpdate(
                    { _id: req.user.id, 'wallet.currency': symbolUpper },
                    { $inc: { 'wallet.$.balance': buyAmount } }
                );
            } else {
                await User.findByIdAndUpdate(req.user.id, {
                    $push: { wallet: { currency: symbolUpper, balance: buyAmount } }
                });
            }

            const order = new Order({
                userId: req.user.id,
                type: 'buy',
                symbol: symbolUpper,
                amount: buyAmount,
                price,
                total,
                status: 'filled'
            });
            await order.save();

            res.status(201).json({
                message: 'Buy order executed.',
                order: {
                    id: order._id,
                    type: order.type,
                    symbol: order.symbol,
                    amount: order.amount,
                    price: order.price,
                    total: order.total,
                    status: order.status,
                    createdAt: order.createdAt
                }
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error.', error: err.message });
        }
    }
);

// POST /api/trade/sell
router.post(
    '/sell',
    tradingLimiter,
    verifyToken,
    [
        body('symbol').trim().notEmpty().withMessage('Symbol is required'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { symbol, amount } = req.body;
        const symbolUpper = symbol.toUpperCase();
        const sellAmount = parseFloat(amount);

        try {
            const marketEntry = await MarketData.findOne({ symbol: symbolUpper });
            if (!marketEntry) {
                return res.status(404).json({ message: `Symbol ${symbolUpper} not found.` });
            }

            const price = marketEntry.price;
            const total = price * sellAmount;

            // Atomically deduct crypto balance if sufficient
            const deducted = await User.findOneAndUpdate(
                {
                    _id: req.user.id,
                    wallet: { $elemMatch: { currency: symbolUpper, balance: { $gte: sellAmount } } }
                },
                { $inc: { 'wallet.$.balance': -sellAmount } },
                { new: true }
            );

            if (!deducted) {
                return res.status(400).json({ message: `Insufficient ${symbolUpper} balance.` });
            }

            // Atomically add USD to wallet
            const hasUsd = deducted.wallet.some(w => w.currency === 'USD');
            if (hasUsd) {
                await User.findOneAndUpdate(
                    { _id: req.user.id, 'wallet.currency': 'USD' },
                    { $inc: { 'wallet.$.balance': total } }
                );
            } else {
                await User.findByIdAndUpdate(req.user.id, {
                    $push: { wallet: { currency: 'USD', balance: total } }
                });
            }

            const order = new Order({
                userId: req.user.id,
                type: 'sell',
                symbol: symbolUpper,
                amount: sellAmount,
                price,
                total,
                status: 'filled'
            });
            await order.save();

            res.status(201).json({
                message: 'Sell order executed.',
                order: {
                    id: order._id,
                    type: order.type,
                    symbol: order.symbol,
                    amount: order.amount,
                    price: order.price,
                    total: order.total,
                    status: order.status,
                    createdAt: order.createdAt
                }
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error.', error: err.message });
        }
    }
);

// POST /api/trade/cancel/:orderId
router.post('/cancel/:orderId', apiLimiter, verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.orderId, userId: req.user.id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        if (order.status !== 'pending') {
            return res.status(400).json({ message: `Order cannot be cancelled (status: ${order.status}).` });
        }

        order.status = 'cancelled';
        await order.save();

        res.json({ message: 'Order cancelled.', orderId: order._id });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/trade/history
router.get('/history', apiLimiter, verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// GET /api/trade/orders
router.get('/orders', apiLimiter, verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id, status: 'pending' })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;
