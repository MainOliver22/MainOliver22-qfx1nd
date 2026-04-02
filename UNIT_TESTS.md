# UNIT_TESTS.md

## Comprehensive Unit Tests for Backend API Endpoints

This document outlines the comprehensive unit tests for all backend API endpoints using Jest and Supertest.

### 1. Authentication Tests

#### 1.1 Login Test
```javascript
const request = require('supertest');
const app = require('../app');

describe('POST /api/auth/login', () => {
  it('should log in successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'testuser',
        password: 'password123'
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
});
```

#### 1.2 Registration Test
```javascript
describe('POST /api/auth/register', () => {
  it('should register a new user successfully', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'newuser',
        password: 'newpassword123'
      });
    expect(response.statusCode).toBe(201);
  });
});
```

#### 1.3 Token Expiration Test
```javascript
describe('GET /api/protected', () => {
  it('should return 401 for expired token', async () => {
    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', 'Bearer expired_token');
    expect(response.statusCode).toBe(401);
  });
});
```

### 2. Market Data Tests

#### 2.1 Market Data Retrieval Test
```javascript
describe('GET /api/market-data', () => {
  it('should retrieve market data successfully', async () => {
    const response = await request(app).get('/api/market-data');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('data');
  });
});
```

#### 2.2 Market Data Reliability Test
```javascript
describe('GET /api/market-data/reliability', () => {
  it('should check market data reliability', async () => {
    const response = await request(app).get('/api/market-data/reliability');
    expect(response.statusCode).toBe(200);
  });
});
```

### 3. Wallet Operation Tests

#### 3.1 Wallet Creation Test
```javascript
describe('POST /api/wallets', () => {
  it('should create a new wallet successfully', async () => {
    const response = await request(app)
      .post('/api/wallets')
      .send({ userId: '12345' });
    expect(response.statusCode).toBe(201);
  });
});
```

#### 3.2 Wallet Deposit Test
```javascript
describe('POST /api/wallets/deposit', () => {
  it('should deposit money into wallet successfully', async () => {
    const response = await request(app)
      .post('/api/wallets/deposit')
      .send({
        walletId: '67890',
        amount: 100
      });
    expect(response.statusCode).toBe(200);
  });
});
```

#### 3.3 Wallet Withdrawal Test
```javascript
describe('POST /api/wallets/withdraw', () => {
  it('should withdraw money from wallet successfully', async () => {
    const response = await request(app)
      .post('/api/wallets/withdraw')
      .send({
        walletId: '67890',
        amount: 50
      });
    expect(response.statusCode).toBe(200);
  });
});
```

### 4. Trading Endpoint Tests

#### 4.1 Order Creation Test
```javascript
describe('POST /api/orders', () => {
  it('should create a new order successfully', async () => {
    const response = await request(app)
      .post('/api/orders')
      .send({
        userId: '12345',
        productId: 'abcdef',
        quantity: 2
      });
    expect(response.statusCode).toBe(201);
  });
});
```

#### 4.2 Order Cancellation Test
```javascript
describe('DELETE /api/orders/cancel', () => {
  it('should cancel an existing order successfully', async () => {
    const response = await request(app)
      .delete('/api/orders/cancel')
      .send({ orderId: 'order123' });
    expect(response.statusCode).toBe(200);
  });
});
```

#### 4.3 Trade History Retrieval Test
```javascript
describe('GET /api/trade-history', () => {
  it('should retrieve trade history successfully', async () => {
    const response = await request(app).get('/api/trade-history');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('trades');
  });
});
```

## Conclusion

These unit tests are designed to ensure the reliability and security of the backend API endpoints. You can run these tests using Jest to verify the functionality of your application.
