'use strict';

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');

// GET /api/transactions/history - Get user's transaction history
router.get('/history', verifyToken, apiLimiter, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json({ success: true, transactions });
    } catch (err) {
        console.error('Transaction history error:', err);
        res.status(500).json({ message: 'Server error retrieving transaction history.' });
    }
});

// POST /api/transactions/add - Add a transaction
router.post('/add', verifyToken, apiLimiter, [
    body('type').isIn(['deposit', 'withdrawal']).withMessage('type must be deposit or withdrawal.'),
    body('currency').trim().toUpperCase().notEmpty().withMessage('currency is required.'),
    body('amount').isFloat({ gt: 0 }).withMessage('amount must be greater than zero.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
    }

    try {
        const { type, currency, description } = req.body;
        const amount = parseFloat(req.body.amount);

        const transaction = new Transaction({
            userId: req.user.id,
            type,
            currency: currency.toUpperCase(),
            amount,
            status: 'completed',
            description: description || ''
        });
        await transaction.save();

        res.status(201).json({ success: true, transaction });
    } catch (err) {
        console.error('Add transaction error:', err);
        res.status(500).json({ message: 'Server error adding transaction.' });
    }
});

module.exports = router;
