import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import LiveTicker from './components/LiveTicker';
import Dashboard from './components/Dashboard';
import TradingUI from './components/TradingUI';
import Wallet from './components/Wallet';
import Auth from './components/Auth';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

function App() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <div>
            <header style={{ background: '#1a1a2e', color: '#fff', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: 18 }}>
                    CryptoExchange
                </Link>
                <nav style={{ display: 'flex', gap: 16 }}>
                    <Link to="/markets" style={{ color: '#ccc', textDecoration: 'none' }}>Markets</Link>
                    {isAuthenticated ? (
                        <>
                            <Link to="/trade" style={{ color: '#ccc', textDecoration: 'none' }}>Trade</Link>
                            <Link to="/wallet" style={{ color: '#ccc', textDecoration: 'none' }}>Wallet</Link>
                            <Link to="/dashboard" style={{ color: '#ccc', textDecoration: 'none' }}>Dashboard</Link>
                        </>
                    ) : (
                        <Link to="/auth" style={{ color: '#ccc', textDecoration: 'none' }}>Login / Register</Link>
                    )}
                </nav>
            </header>

            <main style={{ padding: '20px' }}>
                <Routes>
                    <Route path="/" element={<><LandingPage /><LiveTicker /></>} />
                    <Route path="/markets" element={<LiveTicker />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path="/trade" element={<PrivateRoute><TradingUI /></PrivateRoute>} />
                    <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
                    <Route path="*" element={<h2>404 — Page not found</h2>} />
                </Routes>
            </main>

            <footer style={{ background: '#f1f1f1', padding: '12px 20px', textAlign: 'center', marginTop: 40 }}>
                <p>&copy; 2026 MainOliver22 — CryptoExchange</p>
            </footer>
        </div>
    );
}

export default App;
