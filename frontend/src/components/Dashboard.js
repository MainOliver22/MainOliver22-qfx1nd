import React from 'react';

const Dashboard = () => {
    const userBalance = 1000; // Placeholder for user's balance
    const portfolio = [
        { name: 'Stock A', value: 500 },
        { name: 'Stock B', value: 300 },
        { name: 'Stock C', value: 200 }
    ];

    return (
        <div>
            <h1>User Dashboard</h1>
            <h2>Balance: ${userBalance}</h2>
            <h3>Portfolio</h3>
            <ul>
                {portfolio.map((stock, index) => (
                    <li key={index}>{stock.name}: ${stock.value}</li>
                ))}
            </ul>
        </div>
    );
};

export default Dashboard;