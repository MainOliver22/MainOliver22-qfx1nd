import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [balance, setBalance] = useState([]);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [balRes, ordersRes] = await Promise.all([
                    api.getBalance(),
                    api.getTradeHistory()
                ]);
                setBalance(balRes.data.balance || []);
                setOrders(ordersRes.data.orders || []);
            } catch (err) {
                setError('Failed to load dashboard data.');
            }
        };
        fetchData();
    }, []);

    const handleLogout = async () => {
        try { await api.logout(); } catch (_) {}
        logout();
        navigate('/');
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Dashboard</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>
            {user && <p>Welcome, <strong>{user.username || 'User'}</strong></p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <h2>Wallet Balances</h2>
            {balance.length === 0 ? (
                <p>Loading balances...</p>
            ) : (
                <ul>
                    {balance.map((entry) => (
                        <li key={entry.currency}>
                            {entry.currency}: {entry.balance}
                        </li>
                    ))}
                </ul>
            )}

            <h2>Recent Trades</h2>
            {orders.length === 0 ? (
                <p>No trades yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Type</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Symbol</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Amount</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Price</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.slice(0, 10).map((order) => (
                            <tr key={order._id}>
                                <td>{order.type}</td>
                                <td>{order.symbol}</td>
                                <td>{order.amount}</td>
                                <td>${order.price}</td>
                                <td>${order.total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Dashboard;