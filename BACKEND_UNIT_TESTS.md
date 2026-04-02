# BACKEND_UNIT_TESTS

This document outlines comprehensive unit tests for various backend endpoints related to authentication, market data, wallet operations, and trading.

## 1. Authentication
### Test Cases
1. **Successful Login**  
   - **Description**: Verify that a user can log in with valid credentials.  
   - **Input**: Valid email and password.  
   - **Expected Outcome**: JWT token is returned.

2. **Failed Login**  
   - **Description**: Verify that login fails with invalid credentials.  
   - **Input**: Invalid email and/or password.  
   - **Expected Outcome**: Error message indicating invalid credentials.

3. **Password Reset Request**  
   - **Description**: Verify that a password reset request can be made.  
   - **Input**: Registered email address.  
   - **Expected Outcome**: Success message stating email has been sent.

## 2. Market Data
### Test Cases
1. **Get Market Price**  
   - **Description**: Verify that the market price can be fetched for a specific asset.  
   - **Input**: Asset ID.  
   - **Expected Outcome**: Current price of the asset.

2. **Get Historical Data**  
   - **Description**: Verify that historical market data can be retrieved.  
   - **Input**: Asset ID, date range.  
   - **Expected Outcome**: List of historical prices.

## 3. Wallet Operations
### Test Cases
1. **Check Balance**  
   - **Description**: Verify that the user can check their wallet balance.  
   - **Input**: User ID.  
   - **Expected Outcome**: Current wallet balance.

2. **Deposit Funds**  
   - **Description**: Verify that a user can deposit funds into their wallet.  
   - **Input**: User ID, amount.  
   - **Expected Outcome**: Success message after deposit.

3. **Withdraw Funds**  
   - **Description**: Verify that a user can withdraw funds from their wallet.  
   - **Input**: User ID, amount.  
   - **Expected Outcome**: Success message after withdrawal.

## 4. Trading Endpoints
### Test Cases
1. **Place Order**  
   - **Description**: Verify that a user can place a buy/sell order.  
   - **Input**: User ID, asset ID, order type (buy/sell), amount.  
   - **Expected Outcome**: Confirmation of order placement.

2. **Cancel Order**  
   - **Description**: Verify that a user can cancel an existing order.  
   - **Input**: User ID, order ID.  
   - **Expected Outcome**: Confirmation of order cancellation.

3. **Get Order Status**  
   - **Description**: Verify that a user can check the status of an order.  
   - **Input**: User ID, order ID.  
   - **Expected Outcome**: Current status of the order.

---
*Date Created: 2026-03-30 23:39:12 UTC*