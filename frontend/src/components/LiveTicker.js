import React, { useEffect, useState } from 'react';

const LiveTicker = () => {
    const [prices, setPrices] = useState({});

    const fetchPrices = async () => {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd');
            const data = await response.json();
            setPrices(data);
        } catch (error) {
            console.error('Error fetching prices:', error);
        }
    };

    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>Live Crypto Prices</h1>
            <ul>
                <li>Bitcoin: ${prices.bitcoin?.usd}</li>
                <li>Ethereum: ${prices.ethereum?.usd}</li>
                <li>Litecoin: ${prices.litecoin?.usd}</li>
            </ul>
        </div>
    );
};

export default LiveTicker;