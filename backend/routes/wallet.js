const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { verifyToken } = require('../middleware/auth');

// GET /api/wallet/balance - Retrieve user's wallet balance
router.get('/balance', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('wallet username');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ success: true, username: user.username, balance: user.wallet });
    } catch (err) {
        console.error('Balance error:', err);
        res.status(500).json({ message: 'Server error retrieving balance.' });
    }
});

// POST /api/wallet/deposit - Record deposit transaction
router.post('/deposit', verifyToken, async (req, res) => {
    try {
        const { currency, amount } = req.body;
        if (!currency || !amount) {
            return res.status(400).json({ message: 'Currency and amount are required.' });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero.' });
        }

        const validCurrencies = ['USD', 'BTC', 'ETH', 'LTC'];
        if (!validCurrencies.includes(currency.toUpperCase())) {
            return res.status(400).json({ message: `Unsupported currency. Supported: ${validCurrencies.join(', ')}` });
        }

        const currencyKey = currency.toUpperCase();
        const updateField = `wallet.${currencyKey}`;
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $inc: { [updateField]: amount } },
            { new: true, select: 'wallet username' }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const transaction = new Transaction({
            userId: req.user.id,
            type: 'deposit',
            currency: currencyKey,
            amount,
            status: 'completed',
            description: `Deposit of ${amount} ${currencyKey}`
        });
        await transaction.save();

        res.status(201).json({
            success: true,
            message: `Successfully deposited ${amount} ${currencyKey}.`,
            balance: user.wallet,
            transaction
        });
    } catch (err) {
        console.error('Deposit error:', err);
        res.status(500).json({ message: 'Server error processing deposit.' });
    }
});

// POST /api/wallet/withdraw - Process withdrawal with validation
router.post('/withdraw', verifyToken, async (req, res) => {
    try {
        const { currency, amount } = req.body;
        if (!currency || !amount) {
            return res.status(400).json({ message: 'Currency and amount are required.' });
        }
        if (amount <= 0) {
            return res.status(400).json({ message: 'Amount must be greater than zero.' });
        }

        const validCurrencies = ['USD', 'BTC', 'ETH', 'LTC'];
        const currencyKey = currency.toUpperCase();
        if (!validCurrencies.includes(currencyKey)) {
            return res.status(400).json({ message: `Unsupported currency. Supported: ${validCurrencies.join(', ')}` });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const currentBalance = user.wallet[currencyKey] || 0;
        if (currentBalance < amount) {
            return res.status(400).json({ message: `Insufficient ${currencyKey} balance. Available: ${currentBalance}` });
        }

        const updateField = `wallet.${currencyKey}`;
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id, [updateField]: { $gte: amount } },
            { $inc: { [updateField]: -amount } },
            { new: true, select: 'wallet username' }
        );

        if (!updatedUser) {
            return res.status(400).json({ message: `Insufficient ${currencyKey} balance.` });
        }

        const transaction = new Transaction({
            userId: req.user.id,
            type: 'withdrawal',
            currency: currencyKey,
            amount,
            status: 'completed',
            description: `Withdrawal of ${amount} ${currencyKey}`
        });
        await transaction.save();

        res.json({
            success: true,
            message: `Successfully withdrew ${amount} ${currencyKey}.`,
            balance: updatedUser.wallet,
            transaction
        });
    } catch (err) {
        console.error('Withdrawal error:', err);
        res.status(500).json({ message: 'Server error processing withdrawal.' });
    }
});

// GET /api/wallet/history - View transaction history
router.get('/history', verifyToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, transactions });
    } catch (err) {
        console.error('Transaction history error:', err);
        res.status(500).json({ message: 'Server error retrieving transaction history.' });
    }
});

module.exports = router;