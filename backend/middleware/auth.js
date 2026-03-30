const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set.');
    process.exit(1);
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

module.exports = {
    // Generate a signed JWT for a user document
    generateToken: (user) => {
        const payload = { id: user._id || user.id, username: user.username };
        return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    },

    // Express middleware – validates Bearer token and attaches decoded payload to req.user
    verifyToken: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid or expired token.' });
            }
            req.user = decoded;
            next();
        });
    },

    // Validate registration input fields
    validateRegisterInput: (username, email, password) => {
        const errors = [];
        if (!username || username.trim().length < 3) {
            errors.push('Username must be at least 3 characters.');
        }
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            errors.push('A valid email address is required.');
        }
        if (!password || password.length < 6) {
            errors.push('Password must be at least 6 characters.');
        }
        return errors;
    }
};