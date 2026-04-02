# Comprehensive Cryptocurrency Exchange Platform Documentation

## Features
- User registration and authentication (JWT-based)
- Multi-currency wallet support (USD, BTC, ETH, LTC)
- Real-time market data
- Buy/sell trading with atomic balance updates
- Transaction and order history

## API Endpoints

### Authentication (`/api/auth`)
- **POST /api/auth/register** – Register a new user
- **POST /api/auth/login** – Log in and receive a JWT token
- **POST /api/auth/logout** – Invalidate session (client-side token discard)

### Market Data (`/api/market`)
- **GET /api/market/data** – Retrieve current market data for all assets
- **GET /api/market/tickers** – Get ticker information for all assets
- **GET /api/market/ticker/:symbol** – Get ticker for a specific symbol
- **GET /api/market/prices** – Retrieve current prices (legacy)
- **GET /api/market/charts** – Chart placeholder data
- **GET /api/market/order-books** – Order book placeholder
- **GET /api/market/trades** – Recent trades placeholder

### Wallet (`/api/wallet`) *(requires authentication)*
- **GET /api/wallet/balance** – Retrieve wallet balances
- **POST /api/wallet/deposit** – Deposit funds into the wallet
- **POST /api/wallet/withdraw** – Withdraw funds from the wallet
- **GET /api/wallet/transactions** – View transaction history

### Trading (`/api/trade`) *(requires authentication)*
- **POST /api/trade/buy** – Execute a buy order
- **POST /api/trade/sell** – Execute a sell order
- **GET /api/trade/history** – Retrieve trading history
- **GET /api/trade/orders** – Get active/pending orders

### Orders (`/api/orders`) *(requires authentication)*
- **POST /api/orders/place** – Place an order
- **GET /api/orders/history** – Retrieve order history

### Transactions (`/api/transactions`) *(requires authentication)*
- **GET /api/transactions/history** – Get transaction history
- **POST /api/transactions/add** – Add a transaction record

### Health Check
- **GET /health** – Server health check

## Setup Instructions
1. Clone the repository
   ```bash
   git clone https://github.com/MainOliver22/MainOliver22-qfx1nd.git
   ```
2. Install backend dependencies
   ```bash
   cd backend && npm install
   ```
3. Copy and configure environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI, JWT secret, etc.
   ```
4. Start the application
   ```bash
   npm start
   ```

## Tech Stack
- Node.js
- Express.js
- MongoDB (via Mongoose)
- React.js

Feel free to reach out for further questions!