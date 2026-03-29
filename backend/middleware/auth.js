const jwt = require('jsonwebtoken');

// Middleware for JWT authentication
module.exports = {
    // Generate a token
    generateToken: (user) => {
        const payload = {
            id: user.id,
            username: user.username
        };
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    },

    // Verify a token
    verifyToken: (req, res, next) => {
        const token = req.headers['authorization']?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token.' });
            }
            req.user = decoded;
            next();
        });
    }
};