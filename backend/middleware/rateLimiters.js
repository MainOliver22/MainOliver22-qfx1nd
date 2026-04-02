const rateLimit = require('express-rate-limit');

const isTest = process.env.NODE_ENV === 'test';

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 0 : 100,
    skip: () => isTest,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isTest ? 0 : 20,
    skip: () => isTest,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many authentication attempts, please try again later.' }
});

module.exports = { apiLimiter, authLimiter };
