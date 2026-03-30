const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken, validateRegisterInput } = require('../middleware/auth');

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const errors = validateRegisterInput(username, email, password);
        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation failed.', errors });
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            const field = existingUser.email === email ? 'Email' : 'Username';
            return res.status(409).json({ message: `${field} is already in use.` });
        }

        const user = await User.create({ username, email, password });
        const token = generateToken(user);

        return res.status(201).json({
            message: 'User registered successfully.',
            token,
            user
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error during registration.', error: err.message });
    }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const token = generateToken(user);
        return res.status(200).json({
            message: 'Login successful.',
            token,
            user
        });
    } catch (err) {
        return res.status(500).json({ message: 'Server error during login.', error: err.message });
    }
});

module.exports = router;