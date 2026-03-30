const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

module.exports = {
    hashPassword: async (password) => {
        return bcrypt.hash(password, SALT_ROUNDS);
    },

    comparePassword: async (password, hash) => {
        return bcrypt.compare(password, hash);
    },

    generateToken: (user) => {
        const payload = {
            id: user._id || user.id,
            username: user.username
        };
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '1h'
        });
    },

    verifyToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token.' });
            }
            req.user = decoded;
            next();
        });
    }
};
