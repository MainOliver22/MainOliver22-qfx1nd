const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const { hashPassword, comparePassword, generateToken, verifyToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiters');

// POST /api/auth/register
router.post(
    '/register',
    authLimiter,
    [
        body('username').trim().isLength({ min: 3, max: 30 }).withMessage('Username must be 3–30 characters'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;
        try {
            const existing = await User.findOne({ $or: [{ email }, { username }] });
            if (existing) {
                return res.status(409).json({ message: 'Username or email already in use.' });
            }

            const hashedPassword = await hashPassword(password);
            const user = new User({ username, email, password: hashedPassword });
            await user.save();

            const token = generateToken(user);
            res.status(201).json({
                message: 'User registered successfully.',
                token,
                user: { id: user._id, username: user.username, email: user.email }
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error.', error: err.message });
        }
    }
);

// POST /api/auth/login
router.post(
    '/login',
    authLimiter,
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
        body('password').notEmpty().withMessage('Password required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const isMatch = await comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const token = generateToken(user);
            res.json({
                message: 'Login successful.',
                token,
                user: { id: user._id, username: user.username, email: user.email }
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error.', error: err.message });
        }
    }
);

// POST /api/auth/logout
router.post('/logout', authLimiter, verifyToken, (req, res) => {
    // JWT is stateless; client discards the token. This endpoint signals session end.
    res.json({ message: 'Logged out successfully.' });
});

module.exports = router;
