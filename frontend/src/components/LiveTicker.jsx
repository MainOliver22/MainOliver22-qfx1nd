import React, { useEffect, useState } from 'react';
import { getMarketData } from '../services/api';

const LiveTicker = () => {
    const [coins, setCoins] = useState([]);
    const [error, setError] = useState('');

    const fetchMarketData = async () => {
        try {
            const res = await getMarketData();
            setCoins(res.data.data || []);
        } catch (err) {
            setError('Unable to load market data.');
        }
    };

    useEffect(() => {
        fetchMarketData();
        const interval = setInterval(fetchMarketData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (error) return <section><p style={{ color: 'red' }}>{error}</p></section>;

    return (
        <section>
            <h2>Live Market Prices</h2>
            {coins.length === 0 ? (
                <p>Loading prices...</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    {coins.map((coin) => (
                        <li key={coin.symbol} style={{ background: '#f5f5f5', padding: '8px 16px', borderRadius: 4 }}>
                            <strong>{coin.symbol}</strong>: ${coin.price.toLocaleString()}
                            &nbsp;
                            <span style={{ color: coin.change24h >= 0 ? 'green' : 'red' }}>
                                {coin.change24h >= 0 ? '+' : ''}{coin.change24h}%
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};

export default LiveTicker;