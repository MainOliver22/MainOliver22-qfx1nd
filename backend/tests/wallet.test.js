'use strict';

jest.mock('../config/database', () => jest.fn().mockResolvedValue());
jest.mock('../models/User');
jest.mock('../models/Transaction');

const request = require('supertest');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test_jwt_secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.NODE_ENV = 'test';

const app = require('../server');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const userId = 'user123';
const token = jwt.sign({ id: userId, username: 'testuser' }, JWT_SECRET, { expiresIn: '1h' });

const mockWallet = [
    { currency: 'USD', balance: 1000 },
    { currency: 'BTC', balance: 0.5 },
    { currency: 'ETH', balance: 2 },
    { currency: 'LTC', balance: 0 }
];

describe('Wallet Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/wallet/balance', () => {
        it('should return wallet balance for authenticated user', async () => {
            User.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({ _id: userId, username: 'testuser', wallet: mockWallet })
            });

            const res = await request(app)
                .get('/api/wallet/balance')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('balance');
            expect(Array.isArray(res.body.balance)).toBe(true);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/wallet/balance');
            expect(res.statusCode).toBe(401);
        });

        it('should return 404 when user not found', async () => {
            User.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            const res = await request(app)
                .get('/api/wallet/balance')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(404);
        });
    });

    describe('POST /api/wallet/deposit', () => {
        it('should deposit USD into wallet', async () => {
            User.findOneAndUpdate = jest.fn().mockResolvedValue({
                _id: userId,
                username: 'testuser',
                wallet: [{ currency: 'USD', balance: 1500 }]
            });

            const mockTxn = { save: jest.fn().mockResolvedValue() };
            Transaction.mockImplementation(() => mockTxn);

            const res = await request(app)
                .post('/api/wallet/deposit')
                .set('Authorization', `Bearer ${token}`)
                .send({ currency: 'USD', amount: 500 });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should reject invalid currency', async () => {
            const res = await request(app)
                .post('/api/wallet/deposit')
                .set('Authorization', `Bearer ${token}`)
                .send({ currency: 'INVALID', amount: 100 });
            expect(res.statusCode).toBe(400);
        });

        it('should reject zero amount', async () => {
            const res = await request(app)
                .post('/api/wallet/deposit')
                .set('Authorization', `Bearer ${token}`)
                .send({ currency: 'USD', amount: 0 });
            expect(res.statusCode).toBe(400);
        });

        it('should reject negative amount', async () => {
            const res = await request(app)
                .post('/api/wallet/deposit')
                .set('Authorization', `Bearer ${token}`)
                .send({ currency: 'USD', amount: -100 });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/wallet/withdraw', () => {
        it('should withdraw from wallet with sufficient balance', async () => {
            User.findOneAndUpdate = jest.fn().mockResolvedValue({
                _id: userId,
                username: 'testuser',
                wallet: [{ currency: 'USD', balance: 800 }]
            });

            const mockTxn = { save: jest.fn().mockResolvedValue() };
            Transaction.mockImplementation(() => mockTxn);

            const res = await request(app)
                .post('/api/wallet/withdraw')
                .set('Authorization', `Bearer ${token}`)
                .send({ currency: 'USD', amount: 200 });

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
        });

        it('should reject withdrawal with insufficient balance', async () => {
            // findOneAndUpdate returns null when balance check fails
            User.findOneAndUpdate = jest.fn().mockResolvedValue(null);
            User.findById = jest.fn().mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    wallet: [{ currency: 'USD', balance: 100 }]
                })
            });

            const res = await request(app)
                .post('/api/wallet/withdraw')
                .set('Authorization', `Bearer ${token}`)
                .send({ currency: 'USD', amount: 99999 });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('Insufficient');
        });
    });

    describe('GET /api/wallet/transactions', () => {
        it('should return transaction history', async () => {
            const sortMock = jest.fn().mockResolvedValue([{ type: 'deposit', amount: 100 }]);
            Transaction.find = jest.fn().mockReturnValue({ sort: sortMock });

            const res = await request(app)
                .get('/api/wallet/transactions')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.transactions)).toBe(true);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/wallet/transactions');
            expect(res.statusCode).toBe(401);
        });
    });
});
