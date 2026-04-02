import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h1>Welcome to the Cryptocurrency Exchange</h1>
            <p>Trade Bitcoin, Ethereum, Litecoin, and more with ease.</p>
            {isAuthenticated ? (
                <Link to="/dashboard">
                    <button style={{ padding: '12px 24px', fontSize: 16 }}>Go to Dashboard</button>
                </Link>
            ) : (
                <Link to="/auth">
                    <button style={{ padding: '12px 24px', fontSize: 16 }}>Get Started</button>
                </Link>
            )}
        </div>
    );
};

export default LandingPage;