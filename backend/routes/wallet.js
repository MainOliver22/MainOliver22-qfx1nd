const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { verifyToken } = require('../middleware/auth');

// GET /api/v1/wallet/balance – retrieve balances for the authenticated user
router.get('/balance', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        return res.status(200).json({ wallets: user.wallets });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to retrieve balance.', error: err.message });
    }
});

// POST /api/v1/wallet/deposit – deposit funds into the user's wallet
router.post('/deposit', verifyToken, async (req, res) => {
    try {
        const { currency, amount } = req.body;
        if (!currency || amount === undefined) {
            return res.status(400).json({ message: 'currency and amount are required.' });
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'amount must be a positive number.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const wallet = user.wallets.find(w => w.currency === currency.toUpperCase());
        if (!wallet) {
            return res.status(400).json({ message: `No wallet found for currency ${currency}.` });
        }

        wallet.balance += parsedAmount;
        await user.save();

        const transaction = await Transaction.create({
            userId: user._id,
            type: 'deposit',
            currency: currency.toUpperCase(),
            amount: parsedAmount,
            status: 'completed',
            description: `Deposit of ${parsedAmount} ${currency.toUpperCase()}`
        });

        return res.status(200).json({ message: 'Deposit successful.', wallet, transaction });
    } catch (err) {
        return res.status(500).json({ message: 'Deposit failed.', error: err.message });
    }
});

// POST /api/v1/wallet/withdraw – withdraw funds from the user's wallet
router.post('/withdraw', verifyToken, async (req, res) => {
    try {
        const { currency, amount } = req.body;
        if (!currency || amount === undefined) {
            return res.status(400).json({ message: 'currency and amount are required.' });
        }
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ message: 'amount must be a positive number.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const wallet = user.wallets.find(w => w.currency === currency.toUpperCase());
        if (!wallet) {
            return res.status(400).json({ message: `No wallet found for currency ${currency}.` });
        }
        if (wallet.balance < parsedAmount) {
            return res.status(400).json({ message: 'Insufficient balance.' });
        }

        wallet.balance -= parsedAmount;
        await user.save();

        const transaction = await Transaction.create({
            userId: user._id,
            type: 'withdrawal',
            currency: currency.toUpperCase(),
            amount: parsedAmount,
            status: 'completed',
            description: `Withdrawal of ${parsedAmount} ${currency.toUpperCase()}`
        });

        return res.status(200).json({ message: 'Withdrawal successful.', wallet, transaction });
    } catch (err) {
        return res.status(500).json({ message: 'Withdrawal failed.', error: err.message });
    }
});

module.exports = router;