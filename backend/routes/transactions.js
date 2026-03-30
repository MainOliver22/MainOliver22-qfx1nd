'use strict';

const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
const { verifyToken } = require('../middleware/auth');

// GET /api/v1/order – list open orders for the authenticated user
router.get('/', verifyToken, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.id, status: 'open' }).sort({ createdAt: -1 });
        return res.status(200).json({ orders });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to retrieve orders.', error: err.message });
    }
});

// POST /api/v1/order – place a new limit order (persisted, not yet filled)
router.post('/', verifyToken, async (req, res) => {
    try {
        const { type, symbol, quantity, price } = req.body;
        if (!type || !symbol || quantity === undefined || price === undefined) {
            return res.status(400).json({ message: 'type, symbol, quantity, and price are required.' });
        }
        if (!['buy', 'sell'].includes(type)) {
            return res.status(400).json({ message: 'type must be "buy" or "sell".' });
        }
        const parsedQty = parseFloat(quantity);
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedQty) || parsedQty <= 0 || isNaN(parsedPrice) || parsedPrice <= 0) {
            return res.status(400).json({ message: 'quantity and price must be positive numbers.' });
        }

        const order = await Order.create({
            userId: req.user.id,
            type,
            symbol: symbol.toUpperCase(),
            quantity: parsedQty,
            price: parsedPrice,
            totalAmount: parseFloat((parsedQty * parsedPrice).toFixed(8)),
            status: 'open'
        });

        return res.status(201).json({ message: 'Order placed.', order });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to place order.', error: err.message });
    }
});

// DELETE /api/v1/order/:id – cancel an open order
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }
        if (order.status !== 'open') {
            return res.status(400).json({ message: `Cannot cancel an order with status "${order.status}".` });
        }
        order.status = 'cancelled';
        await order.save();
        return res.status(200).json({ message: 'Order cancelled.', order });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to cancel order.', error: err.message });
    }
});

// GET /api/v1/order/transactions – full transaction history for the authenticated user
router.get('/transactions', verifyToken, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.status(200).json({ transactions });
    } catch (err) {
        return res.status(500).json({ message: 'Failed to retrieve transaction history.', error: err.message });
    }
});

module.exports = router;
