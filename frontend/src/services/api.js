import axios from 'axios';

const api = axios.create({
    baseURL: '/api'
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');

// Market
export const getMarketData = () => api.get('/market/data');
export const getTickers = () => api.get('/market/tickers');
export const getTicker = (symbol) => api.get(`/market/ticker/${symbol}`);

// Wallet
export const getBalance = () => api.get('/wallet/balance');
export const deposit = (data) => api.post('/wallet/deposit', data);
export const withdraw = (data) => api.post('/wallet/withdraw', data);
export const getTransactions = () => api.get('/wallet/transactions');

// Trade
export const buy = (data) => api.post('/trade/buy', data);
export const sell = (data) => api.post('/trade/sell', data);
export const getTradeHistory = () => api.get('/trade/history');

// Orders
export const placeOrder = (data) => api.post('/orders/place', data);
export const getOrderHistory = () => api.get('/orders/history');

export default api;
