const mongoose = require('mongoose');

const walletEntrySchema = new mongoose.Schema({
    currency: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    }
}, { _id: false });

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    wallet: {
        type: [walletEntrySchema],
        default: [
            { currency: 'USD', balance: 0 },
            { currency: 'BTC', balance: 0 },
            { currency: 'ETH', balance: 0 },
            { currency: 'LTC', balance: 0 }
        ]
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
