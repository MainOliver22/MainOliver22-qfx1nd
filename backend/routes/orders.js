const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Market = require('../models/Market');
const { verifyToken } = require('../middleware/auth');

// Helper to execute a trade (buy/sell)
const executeTrade = async (req, res, tradeType) => {
    const { symbol, quantity } = req.body;
    if (!symbol || quantity === undefined) {
        return res.status(400).json({ message: 'symbol and quantity are required.' });
    }
    const parsedQty = parseFloat(quantity);
    if (isNaN(parsedQty) || parsedQty <= 0) {
        return res.status(400).json({ message: 'quantity must be a positive number.' });
    }

    const market = await Market.findOne({ symbol: symbol.toUpperCase() });
    if (!market) {
        return res.status(404).json({ message: `Market data not found for symbol ${symbol}.` });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    const price = market.price;
    const totalAmount = parseFloat((price * parsedQty).toFixed(8));
    // In a pair like BTC/USD: BTC is the base (crypto), USD is the quote (fiat)
    const quoteCurrency = symbol.split('/')[1] || 'USD';
    const baseCurrency = symbol.split('/')[0];

    const usdWallet = user.wallets.find(w => w.currency === quoteCurrency);
    const cryptoWallet = user.wallets.find(w => w.currency === baseCurrency);

    if (tradeType === 'buy') {
        if (!usdWallet || usdWallet.balance < totalAmount) {
            return res.status(400).json({ message: `Insufficient ${quoteCurrency} balance.` });
        }
        if (!cryptoWallet) {
            return res.status(400).json({ message: `No wallet found for currency ${baseCurrency}.` });
        }
        usdWallet.balance = parseFloat((usdWallet.balance - totalAmount).toFixed(8));
        cryptoWallet.balance = parseFloat((cryptoWallet.balance + parsedQty).toFixed(8));
    } else {
        if (!cryptoWallet || cryptoWallet.balance < parsedQty) {
            return res.status(400).json({ message: `Insufficient ${baseCurrency} balance.` });
        }
        if (!usdWallet) {
            return res.status(400).json({ message: `No wallet found for currency ${quoteCurrency}.` });
        }
        cryptoWallet.balance = parseFloat((cryptoWallet.balance - parsedQty).toFixed(8));
        usdWallet.balance = parseFloat((usdWallet.balance + totalAmount).toFixed(8));
    }

    await user.save();

    const order = await Order.create({
        userId: user._id,
        type: tradeType,
        symbol: symbol.toUpperCase(),
        quantity: parsedQty,
        price,
        totalAmount,
        status: 'filled'
    });

    await Transaction.create({
        userId: user._id,
        type: tradeType,
        currency: symbol.toUpperCase(),
        amount: totalAmount,
        status: 'completed',
        description: `${tradeType === 'buy' ? 'Bought' : 'Sold'} ${parsedQty} ${baseCurrency} at ${price} ${quoteCurrency}`
    });

    return res.status(201).json({ message: `${tradeType} order executed.`, order, wallets: user.wallets });
};

// POST /api/v1/trade/buy
router.post('/buy', verifyToken, (req, res) => executeTrade(req, res, 'buy'));

// POST /api/v1/trade/sell
router.post('/sell', verifyToken, (req, res) => executeTrade(req, res, 'sell'));

// GET /api/v1/trade/history – trade history for the authenticated user
router.get('/history', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to retrieve trade history.', error: err.message });
    }
});

module.exports = router;