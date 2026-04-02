# MongoDB VPS Connection Guide

This guide provides step-by-step instructions for connecting to a MongoDB database hosted on a Virtual Private Server (VPS).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [User Creation](#user-creation)
5. [Firewall Setup](#firewall-setup)
6. [Connection Strings](#connection-strings)
7. [Node.js Backend Configuration Examples](#nodejs-backend-configuration-examples)

## Prerequisites
Before you start, ensure that you have:  
- A VPS running a Linux distribution (e.g., Ubuntu 22.04 LTS)
- Access to the server's terminal
- Necessary permissions to install and configure software

## Installation
1. **Update your package list:**  
   ```bash
   sudo apt update
   ```
2. **Install MongoDB (v7.x):**  
   Install MongoDB using the official MongoDB repository:
   ```bash
   curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt update
   sudo apt install -y mongodb-org
   ```
3. **Start MongoDB service:**  
   ```bash
   sudo systemctl start mongod
   ```
4. **Enable MongoDB to start on boot:**  
   ```bash
   sudo systemctl enable mongod
   ```

## Configuration
1. **Edit the MongoDB configuration file:**  
   ```bash
   sudo nano /etc/mongod.conf
   ```
   - Change the bind IP address to allow connections from your desired IPs (default is localhost):
   ```yaml
   bindIp: 0.0.0.0 # allows connections from any IP
   ```

2. **Restart the MongoDB service to apply changes:**  
   ```bash
   sudo systemctl restart mongod
   ```

## User Creation
1. **Connect to MongoDB shell:**  
   ```bash
   mongosh
   ```
2. **Create a new user with appropriate roles:**  
   ```javascript
   use admin
   db.createUser({
      user: 'yourUser',
      pwd: 'yourPassword',
      roles: [ { role: 'readWrite', db: 'yourDatabase' } ]
   })
   ```

## Firewall Setup
1. **Allow MongoDB port (default 27017) on UFW:**  
   ```bash
   sudo ufw allow 27017
   ```
2. **Enable the firewall if it is not already enabled:**  
   ```bash
   sudo ufw enable
   ```

## Connection Strings
To connect to your MongoDB database, use the following connection string format:
```plaintext
mongodb://yourUser:yourPassword@yourVPS_IP:27017/yourDatabase
```

## Node.js Backend Configuration Examples
The project already uses Mongoose (v7.x) for database connectivity. Set the `MONGODB_URI` environment variable in your `.env` file:

```
MONGODB_URI=mongodb://yourUser:yourPassword@yourVPS_IP:27017/crypto_exchange
```

The `backend/config/database.js` file reads this variable automatically and connects on server start.

If you need a direct MongoDB driver connection:
```javascript
const { MongoClient } = require('mongodb');
const uri = 'mongodb://yourUser:yourPassword@yourVPS_IP:27017/yourDatabase';
const client = new MongoClient(uri);
async function run() {
    try {
        await client.connect();
        console.log('Connected to database');
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
```

## Conclusion
You have successfully set up your MongoDB database on a VPS. Follow the steps in this guide for future references or when troubleshooting connection issues.
