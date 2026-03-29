'use strict';

const express = require('express');
const router = express.Router();

// Mock database for transaction history
let transactionHistory = [];

// Endpoint to get transaction history
router.get('/history', (req, res) => {
    return res.json(employeeHistory);
});

// Endpoint to add a transaction
router.post('/add', (req, res) => {
    const { transactionId, amount, date, description } = req.body;
    const newTransaction = { transactionId, amount, date, description };
    transactionHistory.push(newTransaction);
    return res.status(201).json(newTransaction);
});

module.exports = router;
