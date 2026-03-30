'use strict';

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiters');
const Transaction = require('../models/transaction');

// GET /api/transactions/history
router.get('/history', apiLimiter, verifyToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .select('-__v');
        return res.json(transactions);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

// POST /api/transactions/add
router.post('/add', apiLimiter, verifyToken, async (req, res) => {
    const { type, currency, amount } = req.body;
    if (!type || !currency || !amount) {
        return res.status(400).json({ message: 'type, currency, and amount are required.' });
    }
    try {
        const transaction = new Transaction({
            userId: req.user.id,
            type,
            currency: currency.toUpperCase(),
            amount: parseFloat(amount),
            status: 'completed'
        });
        await transaction.save();
        return res.status(201).json(transaction);
    } catch (err) {
        return res.status(500).json({ message: 'Server error.', error: err.message });
    }
});

module.exports = router;
