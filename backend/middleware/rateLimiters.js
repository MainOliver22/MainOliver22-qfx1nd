const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many requests. Please try again later.' }
});

const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    message: { message: 'Too many requests. Please try again later.' }
});

const tradingLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    message: { message: 'Too many trading requests. Please slow down.' }
});

module.exports = { authLimiter, apiLimiter, tradingLimiter };
