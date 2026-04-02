const mongoose = require('mongoose');

const marketDataSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    change24h: {
        type: Number,
        default: 0
    },
    volume24h: {
        type: Number,
        default: 0,
        min: 0
    },
    marketCap: {
        type: Number,
        default: 0,
        min: 0
    }
}, { timestamps: true });

marketDataSchema.index({ symbol: 1 });

module.exports = mongoose.model('MarketData', marketDataSchema);
