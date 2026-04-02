import React, { useEffect, useState } from 'react';
import * as api from '../services/api';

const Wallet = () => {
    const [balance, setBalance] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [form, setForm] = useState({ currency: 'USD', amount: '' });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            const [balRes, txRes] = await Promise.all([api.getBalance(), api.getTransactions()]);
            setBalance(balRes.data.balance || []);
            setTransactions(txRes.data.transactions || []);
        } catch (err) {
            setError('Failed to load wallet data.');
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setMessage('');
        setError('');
    };

    const handleDeposit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.deposit(form);
            setMessage(res.data.message);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Deposit failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleWithdraw = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.withdraw(form);
            setMessage(res.data.message);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Withdrawal failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section>
            <h2>Wallet</h2>

            <h3>Balances</h3>
            {balance.length === 0 ? (
                <p>Loading...</p>
            ) : (
                <ul>
                    {balance.map((entry) => (
                        <li key={entry.currency}>
                            {entry.currency}: {entry.balance}
                        </li>
                    ))}
                </ul>
            )}

            <h3>Deposit / Withdraw</h3>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <select name="currency" value={form.currency} onChange={handleChange}>
                    <option value="USD">USD</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                    <option value="LTC">LTC</option>
                </select>
                <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="Amount"
                    min="0"
                    step="any"
                />
                <button onClick={handleDeposit} disabled={loading}>Deposit</button>
                <button onClick={handleWithdraw} disabled={loading}>Withdraw</button>
            </div>

            <h3>Transaction History</h3>
            {transactions.length === 0 ? (
                <p>No transactions yet.</p>
            ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Type</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Currency</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Amount</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Status</th>
                            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => (
                            <tr key={tx._id}>
                                <td>{tx.type}</td>
                                <td>{tx.currency}</td>
                                <td>{tx.amount}</td>
                                <td>{tx.status}</td>
                                <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </section>
    );
};

export default Wallet;
