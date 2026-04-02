# Cryptocurrency Exchange Platform Documentation

## Introduction
This document provides comprehensive documentation for the cryptocurrency exchange platform, detailing API endpoints covering authentication, market data, wallet operations, and trading functionalities.

All protected endpoints require a `Bearer` JWT token in the `Authorization` header.

## API Endpoints

### 1. Authentication

#### Register a New User

```
POST /api/auth/register
```

##### Request Body
```json
{
   "username": "myuser",
   "email": "user@example.com",
   "password": "securepassword"
}
```

##### Response (201)
```json
{
   "message": "User registered successfully.",
   "token": "your_jwt_token",
   "user": { "id": "...", "username": "myuser", "email": "user@example.com" }
}
```

#### Log In

```
POST /api/auth/login
```

##### Request Body
```json
{
   "email": "user@example.com",
   "password": "securepassword"
}
```

##### Response (200)
```json
{
   "message": "Login successful.",
   "token": "your_jwt_token",
   "user": { "id": "...", "username": "myuser", "email": "user@example.com" }
}
```

#### Log Out

```
POST /api/auth/logout
```
*Requires authentication.* Instructs the client to discard its token.

---

### 2. Market Data

#### Get All Market Data

```
GET /api/market/data
```

##### Response (200)
```json
{
   "success": true,
   "data": [
       { "symbol": "BTC", "name": "Bitcoin", "price": 43250.00, "change24h": 2.34, "volume24h": 28900000000, "marketCap": 847000000000 }
   ]
}
```

#### Get All Tickers

```
GET /api/market/tickers
```

##### Response (200)
```json
{
   "success": true,
   "tickers": [
       { "symbol": "BTC/USD", "last": 43250.00, "change": 2.34, "volume": 28900000000, "lastUpdated": "2026-04-01T00:00:00.000Z" }
   ]
}
```

#### Get Single Ticker

```
GET /api/market/ticker/:symbol
```

---

### 3. Wallet Operations *(requires authentication)*

#### Check Wallet Balance

```
GET /api/wallet/balance
```

##### Response (200)
```json
{
   "success": true,
   "username": "myuser",
   "balance": [
       { "currency": "USD", "balance": 10000 },
       { "currency": "BTC", "balance": 0.5 },
       { "currency": "ETH", "balance": 2.0 },
       { "currency": "LTC", "balance": 10.0 }
   ]
}
```

#### Deposit Funds

```
POST /api/wallet/deposit
```

##### Request Body
```json
{
   "currency": "USD",
   "amount": 500
}
```

##### Response (201)
```json
{
   "success": true,
   "message": "Successfully deposited 500 USD.",
   "balance": [...],
   "transaction": { ... }
}
```

#### Withdraw Funds

```
POST /api/wallet/withdraw
```

##### Request Body
```json
{
   "currency": "USD",
   "amount": 200
}
```

---

### 4. Trading Functionality *(requires authentication)*

#### Execute a Buy Order

```
POST /api/trade/buy
```

##### Request Body
```json
{
   "symbol": "BTC",
   "amount": 0.1
}
```

##### Response (201)
```json
{
   "success": true,
   "message": "Buy order executed: 0.1 BTC at $43250",
   "order": { "type": "buy", "symbol": "BTC", "amount": 0.1, "price": 43250, "total": 4325, "status": "filled" }
}
```

#### Execute a Sell Order

```
POST /api/trade/sell
```

##### Request Body
```json
{
   "symbol": "BTC",
   "amount": 0.05
}
```

#### Get Trade History

```
GET /api/trade/history
```

#### Place a Limit/Market Order

```
POST /api/orders/place
```

##### Request Body
```json
{
   "type": "buy",
   "symbol": "ETH",
   "amount": 1,
   "price": 2680.50
}
```

##### Response (201)
```json
{
   "success": true,
   "order": { "type": "buy", "symbol": "ETH", "amount": 1, "price": 2680.50, "total": 2680.50, "status": "filled" }
}
```

---

### 5. Transactions *(requires authentication)*

#### Get Transaction History

```
GET /api/transactions/history
```

#### Add a Transaction Record

```
POST /api/transactions/add
```

##### Request Body
```json
{
   "type": "deposit",
   "currency": "USD",
   "amount": 1000,
   "description": "Initial deposit"
}
```

---

### 6. Health Check

```
GET /health
```

##### Response (200)
```json
{ "status": "ok", "timestamp": "2026-04-01T00:00:00.000Z" }
```

## Conclusion
This document will be updated as new endpoints and features are added to the cryptocurrency exchange platform.