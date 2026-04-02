import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const Auth = () => {
    const [mode, setMode] = useState('login');
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (mode === 'register') {
                const res = await api.register(form);
                login(res.data.user, res.data.token);
            } else {
                const res = await api.login({ email: form.email, password: form.password });
                login(res.data.user, res.data.token);
            }
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section style={{ maxWidth: 400, margin: '40px auto', padding: '0 20px' }}>
            <h2>{mode === 'login' ? 'Login' : 'Register'}</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleSubmit}>
                {mode === 'register' && (
                    <div style={{ marginBottom: 12 }}>
                        <label>Username</label><br />
                        <input
                            type="text"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            placeholder="Username"
                            required
                            style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                        />
                    </div>
                )}
                <div style={{ marginBottom: 12 }}>
                    <label>Email</label><br />
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                    />
                </div>
                <div style={{ marginBottom: 12 }}>
                    <label>Password</label><br />
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Password"
                        required
                        style={{ width: '100%', padding: 8, boxSizing: 'border-box' }}
                    />
                </div>
                <button type="submit" disabled={loading} style={{ width: '100%', padding: 10 }}>
                    {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
                </button>
            </form>
            <p style={{ marginTop: 16, textAlign: 'center' }}>
                {mode === 'login' ? (
                    <>No account? <button onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>Register</button></>
                ) : (
                    <>Have an account? <button onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>Login</button></>
                )}
            </p>
        </section>
    );
};

export default Auth;
