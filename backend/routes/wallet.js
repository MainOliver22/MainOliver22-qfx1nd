const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');
const User = require('../models/user');
const Transaction = require('../models/transaction');

// GET /api/wallet/balance
router.get('/balance', apiLimiter, verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id, 'wallet');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.json({ wallet: user.wallet });
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// POST /api/wallet/deposit
router.post(
    '/deposit',
    apiLimiter,
    verifyToken,
    [
        body('currency').trim().notEmpty().withMessage('Currency is required'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currency, amount } = req.body;
        const currencyUpper = currency.toUpperCase();
        const depositAmount = parseFloat(amount);

        try {
            const updated = await User.findOneAndUpdate(
                { _id: req.user.id, 'wallet.currency': currencyUpper },
                { $inc: { 'wallet.$.balance': depositAmount } },
                { new: true, select: 'wallet' }
            );

            if (!updated) {
                return res.status(400).json({ message: `Currency ${currencyUpper} not supported or user not found.` });
            }

            const transaction = new Transaction({
                userId: req.user.id,
                type: 'deposit',
                currency: currencyUpper,
                amount: depositAmount,
                status: 'completed'
            });
            await transaction.save();

            const newBalance = updated.wallet.find(w => w.currency === currencyUpper).balance;
            res.json({
                message: 'Deposit successful.',
                currency: currencyUpper,
                deposited: depositAmount,
                newBalance,
                transactionId: transaction._id
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error.', error: err.message });
        }
    }
);

// POST /api/wallet/withdraw
router.post(
    '/withdraw',
    apiLimiter,
    verifyToken,
    [
        body('currency').trim().notEmpty().withMessage('Currency is required'),
        body('amount').isFloat({ gt: 0 }).withMessage('Amount must be a positive number')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currency, amount } = req.body;
        const currencyUpper = currency.toUpperCase();
        const withdrawAmount = parseFloat(amount);

        try {
            // Atomically decrement balance only if sufficient funds exist
            const updated = await User.findOneAndUpdate(
                {
                    _id: req.user.id,
                    wallet: { $elemMatch: { currency: currencyUpper, balance: { $gte: withdrawAmount } } }
                },
                { $inc: { 'wallet.$.balance': -withdrawAmount } },
                { new: true, select: 'wallet' }
            );

            if (!updated) {
                // Distinguish between user-not-found and insufficient balance
                const user = await User.findOne({ _id: req.user.id, 'wallet.currency': currencyUpper }, 'wallet.$');
                if (!user) {
                    return res.status(400).json({ message: `Currency ${currencyUpper} not supported or user not found.` });
                }
                return res.status(400).json({ message: 'Insufficient balance.' });
            }

            const transaction = new Transaction({
                userId: req.user.id,
                type: 'withdrawal',
                currency: currencyUpper,
                amount: withdrawAmount,
                status: 'completed'
            });
            await transaction.save();

            const newBalance = updated.wallet.find(w => w.currency === currencyUpper).balance;
            res.json({
                message: 'Withdrawal successful.',
                currency: currencyUpper,
                withdrawn: withdrawAmount,
                newBalance,
                transactionId: transaction._id
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error.', error: err.message });
        }
    }
);

// GET /api/wallet/transactions
router.get('/transactions', apiLimiter, verifyToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');
        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;
