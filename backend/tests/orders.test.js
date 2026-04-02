'use strict';

jest.mock('../config/database', () => jest.fn().mockResolvedValue());
jest.mock('../models/Order');

const request = require('supertest');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test_jwt_secret';
process.env.JWT_SECRET = JWT_SECRET;
process.env.NODE_ENV = 'test';

const app = require('../server');
const Order = require('../models/Order');

const userId = 'user123';
const token = jwt.sign({ id: userId, username: 'orderuser' }, JWT_SECRET, { expiresIn: '1h' });

describe('Orders Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/orders/place', () => {
        it('should place a buy order successfully', async () => {
            const mockOrder = {
                save: jest.fn().mockResolvedValue(),
                _id: 'order1',
                type: 'buy',
                symbol: 'BTC',
                amount: 0.5,
                price: 43000,
                total: 21500,
                status: 'filled'
            };
            Order.mockImplementation(() => mockOrder);

            const res = await request(app)
                .post('/api/orders/place')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'buy', symbol: 'BTC', amount: 0.5, price: 43000 });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.order.type).toBe('buy');
            expect(res.body.order.symbol).toBe('BTC');
        });

        it('should place a sell order successfully', async () => {
            const mockOrder = {
                save: jest.fn().mockResolvedValue(),
                type: 'sell',
                symbol: 'ETH',
                amount: 2,
                price: 2700,
                total: 5400,
                status: 'filled'
            };
            Order.mockImplementation(() => mockOrder);

            const res = await request(app)
                .post('/api/orders/place')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'sell', symbol: 'ETH', amount: 2, price: 2700 });

            expect(res.statusCode).toBe(201);
            expect(res.body.success).toBe(true);
        });

        it('should reject order with invalid type', async () => {
            const res = await request(app)
                .post('/api/orders/place')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'hold', symbol: 'BTC', amount: 1, price: 43000 });
            expect(res.statusCode).toBe(400);
        });

        it('should reject order with missing fields', async () => {
            const res = await request(app)
                .post('/api/orders/place')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'buy', symbol: 'BTC' });
            expect(res.statusCode).toBe(400);
        });

        it('should reject order with zero amount', async () => {
            const res = await request(app)
                .post('/api/orders/place')
                .set('Authorization', `Bearer ${token}`)
                .send({ type: 'buy', symbol: 'BTC', amount: 0, price: 43000 });
            expect(res.statusCode).toBe(400);
        });

        it('should return 401 without token', async () => {
            const res = await request(app)
                .post('/api/orders/place')
                .send({ type: 'buy', symbol: 'BTC', amount: 1, price: 43000 });
            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/orders/history', () => {
        it('should return order history for authenticated user', async () => {
            const sortMock = jest.fn().mockResolvedValue([
                { type: 'buy', symbol: 'BTC', amount: 0.5, price: 43000 }
            ]);
            Order.find = jest.fn().mockReturnValue({ sort: sortMock });

            const res = await request(app)
                .get('/api/orders/history')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.orders)).toBe(true);
            expect(res.body.orders.length).toBe(1);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/orders/history');
            expect(res.statusCode).toBe(401);
        });
    });
});
