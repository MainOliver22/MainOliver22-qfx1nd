'use strict';

jest.mock('../config/database', () => jest.fn().mockResolvedValue());
jest.mock('../models/MarketData');

const request = require('supertest');
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const app = require('../server');
const MarketData = require('../models/MarketData');

const mockCoins = [
    { symbol: 'BTC', name: 'Bitcoin', price: 43250, change24h: 2.34, volume24h: 28900000000, marketCap: 847000000000, updatedAt: new Date() },
    { symbol: 'ETH', name: 'Ethereum', price: 2680.50, change24h: 1.87, volume24h: 15200000000, marketCap: 322000000000, updatedAt: new Date() }
];

describe('Market Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock countDocuments and insertMany for seeding
        MarketData.countDocuments = jest.fn().mockResolvedValue(2);
        MarketData.insertMany = jest.fn().mockResolvedValue();

        const sortMock = jest.fn().mockResolvedValue(mockCoins);
        MarketData.find = jest.fn().mockReturnValue({ sort: sortMock });
        MarketData.findOne = jest.fn().mockImplementation(({ symbol }) => {
            const coin = mockCoins.find(c => c.symbol === symbol);
            return Promise.resolve(coin || null);
        });
    });

    describe('GET /api/market/data', () => {
        it('should return market data', async () => {
            const res = await request(app).get('/api/market/data');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data');
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    describe('GET /api/market/tickers', () => {
        it('should return ticker list', async () => {
            const res = await request(app).get('/api/market/tickers');
            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('tickers');
            expect(res.body.tickers[0]).toHaveProperty('symbol');
            expect(res.body.tickers[0]).toHaveProperty('last');
        });
    });

    describe('GET /api/market/ticker/:symbol', () => {
        it('should return ticker for BTC', async () => {
            const res = await request(app).get('/api/market/ticker/BTC');
            expect(res.statusCode).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.symbol).toBe('BTC');
        });

        it('should return 404 for unknown symbol', async () => {
            const res = await request(app).get('/api/market/ticker/UNKNOWN');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('GET /api/market/prices', () => {
        it('should return price list', async () => {
            const res = await request(app).get('/api/market/prices');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body[0]).toHaveProperty('price');
        });
    });

    describe('GET /api/market/charts', () => {
        it('should return chart placeholder data', async () => {
            const res = await request(app).get('/api/market/charts');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/market/order-books', () => {
        it('should return order book placeholder data', async () => {
            const res = await request(app).get('/api/market/order-books');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /api/market/trades', () => {
        it('should return trades placeholder data', async () => {
            const res = await request(app).get('/api/market/trades');
            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });
    });

    describe('GET /health', () => {
        it('should return health status', async () => {
            const res = await request(app).get('/health');
            expect(res.statusCode).toBe(200);
            expect(res.body.status).toBe('ok');
        });
    });
});
