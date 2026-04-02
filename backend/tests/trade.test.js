'use strict';

jest.mock('../config/database', () => jest.fn().mockResolvedValue());
jest.mock('../models/User');
jest.mock('../models/Order');

const request = require('supertest');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test_jwt_secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.NODE_ENV = 'test';

const app = require('../server');
const User = require('../models/User');
const Order = require('../models/Order');

const userId = 'user123';
const token = jwt.sign({ id: userId, username: 'tradeuser' }, JWT_SECRET, { expiresIn: '1h' });

const walletWithFunds = [
    { currency: 'USD', balance: 10000 },
    { currency: 'BTC', balance: 1 },
    { currency: 'ETH', balance: 5 },
    { currency: 'LTC', balance: 0 }
];

describe('Trade Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        const sortMock = jest.fn().mockResolvedValue([]);
        Order.find = jest.fn().mockReturnValue({ sort: sortMock });
    });

    describe('POST /api/trade/buy', () => {
        it('should execute a buy order with sufficient USD balance', async () => {
            User.findById = jest.fn().mockResolvedValue({
                _id: userId,
                wallet: walletWithFunds,
                find: jest.fn()
            });
            User.findOneAndUpdate = jest.fn().mockResolvedValue({ _id: userId });
            const mockOrder = { save: jest.fn().mockResolvedValue(), _id: 'order1', type: 'buy', symbol: 'BTC', amount: 0.1, price: 43250, total: 4325, status: 'filled' };
            Order.mockImplementation(() => mockOrder);

            const res = await request(app)
                .post('/api/trade/buy')
                .set('Authorization', `Bearer ${token}`)
                .send({ symbol: 'BTC', amount: 0.1 });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.order.type).toBe('buy');
        });

        it('should reject buy with insufficient USD balance', async () => {
            User.findById = jest.fn().mockResolvedValue({
                _id: userId,
                wallet: [
                    { currency: 'USD', balance: 0 },
                    { currency: 'BTC', balance: 0 },
                    { currency: 'ETH', balance: 0 },
                    { currency: 'LTC', balance: 0 }
                ]
            });

            const res = await request(app)
                .post('/api/trade/buy')
                .set('Authorization', `Bearer ${token}`)
                .send({ symbol: 'BTC', amount: 1 });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Insufficient');
        });

        it('should reject buy with unknown symbol', async () => {
            User.findById = jest.fn().mockResolvedValue({ _id: userId, wallet: walletWithFunds });

            const res = await request(app)
                .post('/api/trade/buy')
                .set('Authorization', `Bearer ${token}`)
                .send({ symbol: 'FAKE', amount: 1 });

            expect(res.statusCode).toBe(400);
        });

        it('should reject buy with zero amount', async () => {
            const res = await request(app)
                .post('/api/trade/buy')
                .set('Authorization', `Bearer ${token}`)
                .send({ symbol: 'BTC', amount: 0 });
            expect(res.statusCode).toBe(400);
        });

        it('should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/trade/buy')
                .send({ symbol: 'BTC', amount: 0.1 });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/trade/sell', () => {
        it('should execute a sell order with sufficient crypto balance', async () => {
            User.findById = jest.fn().mockResolvedValue({
                _id: userId,
                wallet: walletWithFunds
            });
            User.findOneAndUpdate = jest.fn().mockResolvedValue({ _id: userId });
            const mockOrder = { save: jest.fn().mockResolvedValue(), type: 'sell', symbol: 'BTC', amount: 0.5, price: 43250, total: 21625, status: 'filled' };
            Order.mockImplementation(() => mockOrder);

            const res = await request(app)
                .post('/api/trade/sell')
                .set('Authorization', `Bearer ${token}`)
                .send({ symbol: 'BTC', amount: 0.5 });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.order.type).toBe('sell');
        });

        it('should reject sell with insufficient crypto balance', async () => {
            User.findById = jest.fn().mockResolvedValue({
                _id: userId,
                wallet: [
                    { currency: 'USD', balance: 10000 },
                    { currency: 'BTC', balance: 0.001 },
                    { currency: 'ETH', balance: 0 },
                    { currency: 'LTC', balance: 0 }
                ]
            });

            const res = await request(app)
                .post('/api/trade/sell')
                .set('Authorization', `Bearer ${token}`)
                .send({ symbol: 'BTC', amount: 999 });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Insufficient');
        });

        it('should reject sell with unknown symbol', async () => {
            User.findById = jest.fn().mockResolvedValue({ _id: userId, wallet: walletWithFunds });

            const res = await request(app)
                .post('/api/trade/sell')
                .set('Authorization', `Bearer ${token}`)
                .send({ symbol: 'FAKE', amount: 1 });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/trade/history', () => {
        it('should return trade history', async () => {
            const sortMock = jest.fn().mockResolvedValue([{ type: 'buy', symbol: 'BTC' }]);
            Order.find = jest.fn().mockReturnValue({ sort: sortMock });

            const res = await request(app)
                .get('/api/trade/history')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.orders)).toBe(true);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/trade/history');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/trade/orders', () => {
        it('should return pending orders list', async () => {
            const res = await request(app)
                .get('/api/trade/orders')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.orders)).toBe(true);
        });
    });
});
