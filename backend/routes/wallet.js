const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

const VALID_CURRENCIES = ['USD', 'BTC', 'ETH', 'LTC'];

// GET /api/wallet/balance - Retrieve user's wallet balance
router.get('/balance', verifyToken, apiLimiter, async (req, res) => {
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
router.post('/deposit', verifyToken, apiLimiter, [
    body('currency').trim().toUpperCase().isIn(VALID_CURRENCIES).withMessage(`Supported currencies: ${VALID_CURRENCIES.join(', ')}`),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const currencyKey = req.body.currency.toUpperCase();
        const amount = parseFloat(req.body.amount);

        const user = await User.findOneAndUpdate(
            { _id: req.user.id, 'wallet.currency': currencyKey },
            { $inc: { 'wallet.$.balance': amount } },
            { new: true, select: 'wallet username' }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found or currency not in wallet.' });
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
router.post('/withdraw', verifyToken, apiLimiter, [
    body('currency').trim().toUpperCase().isIn(VALID_CURRENCIES).withMessage(`Supported currencies: ${VALID_CURRENCIES.join(', ')}`),
    body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than zero.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const currencyKey = req.body.currency.toUpperCase();
        const amount = parseFloat(req.body.amount);

        // Atomic withdrawal using $elemMatch to verify balance and $inc to decrement
        const updatedUser = await User.findOneAndUpdate(
            {
                _id: req.user.id,
                wallet: { $elemMatch: { currency: currencyKey, balance: { $gte: amount } } }
            },
            { $inc: { 'wallet.$.balance': -amount } },
            { new: true, select: 'wallet username' }
        );

        if (!updatedUser) {
            const user = await User.findById(req.user.id).select('wallet');
            const entry = user && user.wallet.find(w => w.currency === currencyKey);
            const available = entry ? entry.balance : 0;
            return res.status(400).json({ message: `Insufficient ${currencyKey} balance. Available: ${available}` });
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

// GET /api/wallet/transactions - View transaction history
router.get('/transactions', verifyToken, apiLimiter, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, transactions });
    } catch (err) {
        console.error('Transaction history error:', err);
        res.status(500).json({ message: 'Server error retrieving transaction history.' });
    }
});

module.exports = router;