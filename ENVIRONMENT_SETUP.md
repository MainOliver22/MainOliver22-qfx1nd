# Environment Setup Guide

This document provides the complete configuration guide for setting up the .env file for both the backend and frontend of the application.

## MongoDB Configuration

To connect to your MongoDB database, use the following URI format:

```
MONGODB_URI=mongodb://<username>:<password>@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority
```

**Example:**
```
MONGODB_URI=mongodb://admin:password123@cluster0.mongodb.net/mydatabase?retryWrites=true&w=majority
```

## JWT Configuration

For securing your API, use the following secret for JWT authentication:

```
JWT_SECRET=your_jwt_secret_key
```

**Example:**
```
JWT_SECRET=mysecretpassword
```

## API Keys

Be sure to include any necessary API keys below:

```
API_KEY=your_api_key_here
```

**Example:**
```
API_KEY=123456789abcdef
```

## Other Required Environment Variables

You may have other required environment variables depending on your application's needs. Here’s a placeholder format:

```
OTHER_VARIABLE=value
```

**Example:**
```
NODE_ENV=development
```

Make sure to replace the placeholders with your actual values before running the application.