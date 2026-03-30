const mongoose = require('mongoose');

// Suppress strictQuery deprecation warning from Mongoose 6
mongoose.set('strictQuery', true);

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto_exchange';
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.warn('Running without database. Auth/wallet/trade endpoints require MongoDB.');
    }
};

module.exports = connectDB;
