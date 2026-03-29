const express = require('express');
const router = express.Router();

// Mock database for orders
let orders = [];

// Endpoint to place an order
router.post('/place', (req, res) => {
    const order = { id: orders.length + 1, ...req.body, createdAt: new Date() };
    orders.push(order);
    res.status(201).json(order);
});

// Endpoint to retrieve order history
router.get('/history', (req, res) => {
    res.status(200).json(orders);
});

module.exports = router;