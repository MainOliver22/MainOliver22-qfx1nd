import React from 'react';

const Dashboard = () => {
    const userBalance = 0; // Fetched from /api/wallet/balance
    const portfolio = [
        { name: 'Bitcoin (BTC)', value: 0 },
        { name: 'Ethereum (ETH)', value: 0 },
        { name: 'Litecoin (LTC)', value: 0 }
    ];

    return (
        <div>
            <h1>User Dashboard</h1>
            <h2>USD Balance: ${userBalance}</h2>
            <h3>Crypto Portfolio</h3>
            <ul>
                {portfolio.map((asset, index) => (
                    <li key={index}>{asset.name}: {asset.value}</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;