# Environment Setup Guide

This document provides the complete configuration guide for setting up the .env file for both the backend and frontend of the application.

## MongoDB Configuration

To connect to your MongoDB database, use the following URI format:

```
MONGODB_URI=mongodb://<username>:<password>@<host>:<port>/<database>
```

**Example (local):**
```
MONGODB_URI=mongodb://localhost:27017/crypto_exchange
```

**Example (Atlas):**
```
MONGODB_URI=mongodb+srv://admin:password123@cluster0.mongodb.net/crypto_exchange?retryWrites=true&w=majority
```

## JWT Configuration

For securing your API, use the following secret for JWT authentication:

```
JWT_SECRET=your_jwt_secret_key
```

**Example:**
```
JWT_SECRET=a_long_random_string_change_in_production
```

## JWT Token Expiry

Control how long issued tokens remain valid:

```
JWT_EXPIRES_IN=1h
```

**Accepted formats:** `30m`, `1h`, `7d`, `30d` (jsonwebtoken timespan format).

## Server Port

```
PORT=3000
```

## Node Environment

```
NODE_ENV=development
```

Set to `production` in a production deployment.

Make sure to replace the placeholders with your actual values before running the application.
