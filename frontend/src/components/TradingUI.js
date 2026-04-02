import React, { useState } from 'react';

function TradingUI() {
    const [orderType, setOrderType] = useState('market');
    const [action, setAction] = useState('buy');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');

    const handleOrderTypeChange = (event) => {
        setOrderType(event.target.value);
    };

    const handleActionChange = (event) => {
        setAction(event.target.value);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle order submission logic here.
        console.log(`Submitting ${action} ${orderType} order of amount: ${amount} at price: ${price}`);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    <input type="radio" value="buy" checked={action === 'buy'} onChange={handleActionChange} /> Buy
                </label>
                <label>
                    <input type="radio" value="sell" checked={action === 'sell'} onChange={handleActionChange} /> Sell
                </label>
            </div>
            <div>
                <label>
                    <input type="radio" value="market" checked={orderType === 'market'} onChange={handleOrderTypeChange} /> Market
                </label>
                <label>
                    <input type="radio" value="limit" checked={orderType === 'limit'} onChange={handleOrderTypeChange} /> Limit
                </label>
            </div>
            <div>
                <label>
                    Amount:
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
                </label>
            </div>
            {orderType === 'limit' && (
                <div>
                    <label>
                        Price:
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </label>
                </div>
            )}
            <button type="submit">Place Order</button>
        </form>
    );
}

export default TradingUI;