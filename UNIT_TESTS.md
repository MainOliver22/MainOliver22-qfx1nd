# UNIT_TESTS.md

## Comprehensive Unit Tests for Backend API Endpoints

This document outlines the comprehensive unit tests for all backend API endpoints using Jest and Supertest.

### 1. Authentication Tests

#### 1.1 Login Test
```javascript
const request = require('supertest');
const app = require('../server');

describe('POST /api/auth/login', () => {
  it('should log in successfully with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@example.com',
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
        email: 'newuser@example.com',
        password: 'newpassword123'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('token');
  });
});
```

#### 1.3 Token Expiration / Invalid Token Test
```javascript
describe('POST /api/auth/logout', () => {
  it('should return 403 for an invalid or expired token', async () => {
    const response = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', 'Bearer invalid_or_expired_token');
    expect(response.statusCode).toBe(403);
  });
});
```

### 2. Market Data Tests

#### 2.1 Market Data Retrieval Test
```javascript
describe('GET /api/market/data', () => {
  it('should retrieve market data successfully', async () => {
    const response = await request(app).get('/api/market/data');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('data');
  });
});
```

#### 2.2 Single Ticker Retrieval Test
```javascript
describe('GET /api/market/ticker/:symbol', () => {
  it('should retrieve ticker data for a valid symbol', async () => {
    const response = await request(app).get('/api/market/ticker/BTC');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('symbol', 'BTC');
  });
});
```

### 3. Wallet Operation Tests

#### 3.1 Wallet Balance Test
```javascript
describe('GET /api/wallet/balance', () => {
  it('should retrieve wallet balance for an authenticated user', async () => {
    const response = await request(app)
      .get('/api/wallet/balance')
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('balance');
  });
});
```

#### 3.2 Wallet Deposit Test
```javascript
describe('POST /api/wallet/deposit', () => {
  it('should deposit funds into wallet successfully', async () => {
    const response = await request(app)
      .post('/api/wallet/deposit')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ currency: 'USD', amount: 100 });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
  });
});
```

#### 3.3 Wallet Withdrawal Test
```javascript
describe('POST /api/wallet/withdraw', () => {
  it('should withdraw funds from wallet successfully', async () => {
    const response = await request(app)
      .post('/api/wallet/withdraw')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ currency: 'USD', amount: 50 });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
  });
});
```

### 4. Trading Endpoint Tests

#### 4.1 Buy Order Test
```javascript
describe('POST /api/trade/buy', () => {
  it('should execute a buy order successfully', async () => {
    const response = await request(app)
      .post('/api/trade/buy')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ symbol: 'BTC', amount: 0.01 });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.order).toHaveProperty('type', 'buy');
  });
});
```

#### 4.2 Sell Order Test
```javascript
describe('POST /api/trade/sell', () => {
  it('should execute a sell order successfully', async () => {
    const response = await request(app)
      .post('/api/trade/sell')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ symbol: 'BTC', amount: 0.01 });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body.order).toHaveProperty('type', 'sell');
  });
});
```

#### 4.3 Trade History Retrieval Test
```javascript
describe('GET /api/trade/history', () => {
  it('should retrieve trade history successfully', async () => {
    const response = await request(app)
      .get('/api/trade/history')
      .set('Authorization', `Bearer ${validToken}`);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('orders');
  });
});
```

#### 4.4 Place Order Test
```javascript
describe('POST /api/orders/place', () => {
  it('should place a limit order successfully', async () => {
    const response = await request(app)
      .post('/api/orders/place')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ type: 'buy', symbol: 'ETH', amount: 1, price: 2680.50 });
    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('success', true);
  });
});
```

## Conclusion

These unit tests are designed to ensure the reliability and security of the backend API endpoints. You can run these tests using Jest to verify the functionality of your application.
