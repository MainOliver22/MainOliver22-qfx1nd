const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production.');
}
const EFFECTIVE_SECRET = JWT_SECRET || 'default_jwt_secret_change_in_production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // e.g. '1h', '7d', '30m' (jsonwebtoken timespan format)

// Middleware for JWT authentication
module.exports = {
    // Hash a password
    hashPassword: (password) => bcrypt.hash(password, 10),

    // Compare a plain password with a hash
    comparePassword: (password, hash) => bcrypt.compare(password, hash),

    // Generate a token
    generateToken: (user) => {
        const payload = {
            id: user.id || user._id,
            username: user.username
        };
        return jwt.sign(payload, EFFECTIVE_SECRET, { expiresIn: JWT_EXPIRES_IN });
    },

    // Verify a token (middleware)
    verifyToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        jwt.verify(token, EFFECTIVE_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token.' });
            }
            req.user = decoded;
            next();
        });
    }
};