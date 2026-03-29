const express = require('express');
const router = express.Router();

// Assuming you have a WalletController that handles business logic
const WalletController = require('../controllers/walletController');

// Get balance
router.get('/balance', WalletController.getBalance);

// Create deposit
router.post('/deposits', WalletController.createDeposit);

// Create withdrawal
router.post('/withdrawals', WalletController.createWithdrawal);

module.exports = router;