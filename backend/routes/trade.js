const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const { verifyToken } = require('../middleware/auth');

// Mock market prices for trade execution
const marketPrices = {
    BTC: 43250.00,
    ETH: 2680.50,
    LTC: 72.30,
    XRP: 0.6120,
    ADA: 0.3850
};

const getPrice = (symbol) => {
    const price = marketPrices[symbol.toUpperCase()];
    if (!price) return null;
    return parseFloat((price * (1 + (Math.random() - 0.5) * 0.002)).toFixed(2));
};

// POST /api/trade/buy - Execute buy order
router.post('/buy', verifyToken, async (req, res) => {
    try {
        const { symbol, amount } = req.body;
        if (!symbol || !amount) {
            return res.status(400).json({ message: 'Symbol and amount are required.' });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero.' });
        }

        const sym = symbol.toUpperCase();
        const price = getPrice(sym);
        if (!price) {
            return res.status(400).json({ message: `Unsupported symbol: ${symbol}` });
        }

        const total = parseFloat((amount * price).toFixed(2));

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (user.wallet.USD < total) {
            return res.status(400).json({ message: `Insufficient USD balance. Required: ${total}, Available: ${user.wallet.USD}` });
        }

        // Atomically deduct USD and credit crypto, verifying USD balance is still sufficient
        const cryptoField = `wallet.${sym}`;
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id, 'wallet.USD': { $gte: total } },
            { $inc: { 'wallet.USD': -total, [cryptoField]: amount } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: 'Insufficient USD balance.' });
        }

        const order = new Order({
            userId: req.user.id,
            type: 'buy',
            symbol: sym,
            amount,
            price,
            total,
            status: 'filled'
        });
        await order.save();

        res.status(201).json({
            success: true,
            message: `Buy order executed: ${amount} ${sym} at $${price}`,
            order
        });
    } catch (err) {
        console.error('Buy error:', err);
        res.status(500).json({ message: 'Server error executing buy order.' });
    }
});

// POST /api/trade/sell - Execute sell order
router.post('/sell', verifyToken, async (req, res) => {
    try {
        const { symbol, amount } = req.body;
        if (!symbol || !amount) {
            return res.status(400).json({ message: 'Symbol and amount are required.' });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero.' });
        }

        const sym = symbol.toUpperCase();
        const price = getPrice(sym);
        if (!price) {
            return res.status(400).json({ message: `Unsupported symbol: ${symbol}` });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const cryptoBalance = user.wallet[sym] || 0;
        if (cryptoBalance < amount) {
            return res.status(400).json({ message: `Insufficient ${sym} balance. Required: ${amount}, Available: ${cryptoBalance}` });
        }

        const total = parseFloat((amount * price).toFixed(2));

        // Atomically deduct crypto and credit USD, verifying crypto balance is still sufficient
        const cryptoField = `wallet.${sym}`;
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id, [cryptoField]: { $gte: amount } },
            { $inc: { 'wallet.USD': total, [cryptoField]: -amount } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: `Insufficient ${sym} balance.` });
        }

        const order = new Order({
            userId: req.user.id,
            type: 'sell',
            symbol: sym,
            amount,
            price,
            total,
            status: 'filled'
        });
        await order.save();

        res.status(201).json({
            success: true,
            message: `Sell order executed: ${amount} ${sym} at $${price}`,
            order
        });
    } catch (err) {
        console.error('Sell error:', err);
        res.status(500).json({ message: 'Server error executing sell order.' });
    }
});

// GET /api/trade/history - Retrieve user's trading history
router.get('/history', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Trade history error:', err);
        res.status(500).json({ message: 'Server error retrieving trade history.' });
    }
});

// GET /api/trade/orders - Get active/pending orders
router.get('/orders', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id, status: 'pending' }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Orders error:', err);
        res.status(500).json({ message: 'Server error retrieving orders.' });
    }
});

module.exports = router;
