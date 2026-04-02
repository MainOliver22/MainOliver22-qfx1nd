'use strict';

// Mock DB connection so the server starts without a real MongoDB
jest.mock('../config/database', () => jest.fn().mockResolvedValue());
jest.mock('../models/User');

const request = require('supertest');
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.NODE_ENV = 'test';

const app = require('../server');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

describe('Authentication Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            User.findOne.mockResolvedValue(null);

            const fakeUser = {
                _id: 'user123',
                username: 'testuser',
                email: 'test@example.com',
                save: jest.fn().mockResolvedValue()
            };
            User.mockImplementation(() => fakeUser);

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'testuser', email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body.user.username).toBe('testuser');
        });

        it('should reject duplicate username or email', async () => {
            User.findOne.mockResolvedValue({ _id: 'existing' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'taken', email: 'taken@example.com', password: 'password123' });

            expect(res.statusCode).toBe(409);
        });

        it('should reject short username', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'ab', email: 'a@b.com', password: 'password123' });
            expect(res.statusCode).toBe(400);
        });

        it('should reject invalid email', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'validuser', email: 'not-an-email', password: 'password123' });
            expect(res.statusCode).toBe(400);
        });

        it('should reject short password', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ username: 'validuser', email: 'a@b.com', password: '123' });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const hash = await bcrypt.hash('password123', 10);
            User.findOne.mockResolvedValue({
                _id: 'user123',
                username: 'testuser',
                email: 'test@example.com',
                password: hash
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.message).toBe('Login successful.');
        });

        it('should reject wrong password', async () => {
            const hash = await bcrypt.hash('correctpassword', 10);
            User.findOne.mockResolvedValue({
                _id: 'user123',
                username: 'testuser',
                email: 'test@example.com',
                password: hash
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.statusCode).toBe(401);
            expect(res.body.message).toBe('Invalid credentials.');
        });

        it('should reject unknown email', async () => {
            User.findOne.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nobody@example.com', password: 'password123' });

            expect(res.statusCode).toBe(401);
        });

        it('should reject invalid email format', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'not-an-email', password: 'password123' });
            expect(res.statusCode).toBe(400);
        });

        it('should reject missing password', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com' });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('POST /api/auth/logout', () => {
        it('should return 401 without token', async () => {
            const res = await request(app).post('/api/auth/logout');
            expect(res.statusCode).toBe(401);
        });

        it('should return 403 for invalid token', async () => {
            const res = await request(app)
                .post('/api/auth/logout')
                .set('Authorization', 'Bearer bad_token');
            expect(res.statusCode).toBe(403);
        });
    });
});
