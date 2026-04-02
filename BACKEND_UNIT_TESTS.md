# BACKEND_UNIT_TESTS

This document outlines comprehensive unit tests for various backend endpoints related to authentication, market data, wallet operations, and trading.

## 1. Authentication
### Test Cases
1. **Successful Login**  
   - **Description**: Verify that a user can log in with valid credentials.  
   - **Input**: Valid `email` and `password`.  
   - **Expected Outcome**: JWT token is returned with HTTP 200.

2. **Failed Login**  
   - **Description**: Verify that login fails with invalid credentials.  
   - **Input**: Invalid email and/or password.  
   - **Expected Outcome**: HTTP 401 with an error message indicating invalid credentials.

3. **Successful Registration**  
   - **Description**: Verify that a new user can register with a unique username and email.  
   - **Input**: `username`, `email`, and `password`.  
   - **Expected Outcome**: HTTP 201 with a JWT token and user object.

4. **Duplicate Registration**  
   - **Description**: Verify that registration fails when username or email is already in use.  
   - **Input**: Already-registered email or username.  
   - **Expected Outcome**: HTTP 409 with an appropriate error message.

## 2. Market Data
### Test Cases
1. **Get All Market Data**  
   - **Description**: Verify that all market data can be fetched.  
   - **Endpoint**: `GET /api/market/data`  
   - **Expected Outcome**: HTTP 200 with `{ success: true, data: [...] }`.

2. **Get Single Ticker**  
   - **Description**: Verify that data for a specific asset symbol can be retrieved.  
   - **Endpoint**: `GET /api/market/ticker/:symbol` (e.g. `GET /api/market/ticker/BTC`)  
   - **Expected Outcome**: HTTP 200 with the matching asset data; HTTP 404 for unknown symbols.

## 3. Wallet Operations
### Test Cases
1. **Check Balance**  
   - **Description**: Verify that the authenticated user can retrieve their wallet balances.  
   - **Endpoint**: `GET /api/wallet/balance`  
   - **Expected Outcome**: HTTP 200 with `{ success: true, balance: [...] }`.

2. **Deposit Funds**  
   - **Description**: Verify that a user can deposit a supported currency into their wallet.  
   - **Endpoint**: `POST /api/wallet/deposit`  
   - **Input**: `{ currency: "USD", amount: 100 }`  
   - **Expected Outcome**: HTTP 201 with updated balance and transaction record.

3. **Withdraw Funds**  
   - **Description**: Verify that a user can withdraw funds with sufficient balance, and that withdrawal fails when balance is insufficient.  
   - **Endpoint**: `POST /api/wallet/withdraw`  
   - **Input**: `{ currency: "USD", amount: 50 }`  
   - **Expected Outcome**: HTTP 200 with updated balance on success; HTTP 400 when balance is insufficient.

## 4. Trading Endpoints
### Test Cases
1. **Buy Order**  
   - **Description**: Verify that a user can execute a buy order when they have sufficient USD balance.  
   - **Endpoint**: `POST /api/trade/buy`  
   - **Input**: `{ symbol: "BTC", amount: 0.01 }`  
   - **Expected Outcome**: HTTP 201 with order details showing `type: "buy"` and `status: "filled"`.

2. **Sell Order**  
   - **Description**: Verify that a user can execute a sell order when they have sufficient crypto balance.  
   - **Endpoint**: `POST /api/trade/sell`  
   - **Input**: `{ symbol: "BTC", amount: 0.01 }`  
   - **Expected Outcome**: HTTP 201 with order details showing `type: "sell"` and `status: "filled"`.

3. **Get Trade History**  
   - **Description**: Verify that a user can retrieve their full trade history.  
   - **Endpoint**: `GET /api/trade/history`  
   - **Expected Outcome**: HTTP 200 with `{ success: true, orders: [...] }`.

4. **Place Limit/Market Order**  
   - **Description**: Verify that a user can place an order with explicit price via the orders endpoint.  
   - **Endpoint**: `POST /api/orders/place`  
   - **Input**: `{ type: "buy", symbol: "ETH", amount: 1, price: 2680.50 }`  
   - **Expected Outcome**: HTTP 201 with `{ success: true, order: { ... } }`.

---
*Date Created: 2026-03-30 23:39:12 UTC*