import React, { useState } from 'react';
import * as api from '../services/api';

function TradingUI() {
    const [orderType, setOrderType] = useState('market');
    const [action, setAction] = useState('buy');
    const [symbol, setSymbol] = useState('BTC');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);
        try {
            let res;
            if (orderType === 'market') {
                res = action === 'buy'
                    ? await api.buy({ symbol, amount: parseFloat(amount) })
                    : await api.sell({ symbol, amount: parseFloat(amount) });
            } else {
                res = await api.placeOrder({
                    type: action,
                    symbol,
                    amount: parseFloat(amount),
                    price: parseFloat(price)
                });
            }
            setMessage(res.data.message || 'Order placed successfully.');
            setAmount('');
            setPrice('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <h2>Trading</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 8 }}>
                    <label>
                        <input type="radio" value="buy" checked={action === 'buy'} onChange={(e) => setAction(e.target.value)} /> Buy
                    </label>
                    &nbsp;
                    <label>
                        <input type="radio" value="sell" checked={action === 'sell'} onChange={(e) => setAction(e.target.value)} /> Sell
                    </label>
                </div>
                <div style={{ marginBottom: 8 }}>
                    <label>
                        <input type="radio" value="market" checked={orderType === 'market'} onChange={(e) => setOrderType(e.target.value)} /> Market
                    </label>
                    &nbsp;
                    <label>
                        <input type="radio" value="limit" checked={orderType === 'limit'} onChange={(e) => setOrderType(e.target.value)} /> Limit
                    </label>
                </div>
                <div style={{ marginBottom: 8 }}>
                    <label>Symbol:&nbsp;
                        <select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                            <option value="LTC">LTC</option>
                        </select>
                    </label>
                </div>
                <div style={{ marginBottom: 8 }}>
                    <label>Amount:&nbsp;
                        <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" step="any" required />
                    </label>
                </div>
                {orderType === 'limit' && (
                    <div style={{ marginBottom: 8 }}>
                        <label>Price (USD):&nbsp;
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="any" required />
                        </label>
                    </div>
                )}
                <button type="submit" disabled={loading}>
                    {loading ? 'Placing order...' : 'Place Order'}
                </button>
            </form>
        </section>
    );
}

export default TradingUI;