const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    currency: { type: String, required: true },
    balance: { type: Number, default: 0, min: 0 }
});

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
        required: true,
        minlength: 6
    },
    wallet: {
        type: [walletSchema],
        default: [
            { currency: 'USD', balance: 0 },
            { currency: 'BTC', balance: 0 },
            { currency: 'ETH', balance: 0 }
        ]
    }
}, { timestamps: true });

userSchema.index({ email: 1 });
userSchema.index({ username: 1 });

module.exports = mongoose.model('User', userSchema);
