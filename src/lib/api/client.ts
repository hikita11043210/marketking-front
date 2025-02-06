import axios from 'axios';
import { API_ENDPOINT, API_TIMEOUT, API_HEADERS } from '../constants/api';

const apiClient = axios.create({
    baseURL: API_ENDPOINT || 'http://localhost:8000',
    timeout: API_TIMEOUT,
    headers: {
        ...API_HEADERS,
        'Content-Type': 'application/json',
    },
});

// リクエストインターセプター
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        const ebayToken = localStorage.getItem('ebayToken');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // eBay関連のエンドポイントの場合、eBayトークンを追加
        if (config.url?.includes('/ebay/') && ebayToken) {
            config.headers['X-Ebay-Token'] = ebayToken;
        }

        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// レスポンスインターセプター
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        if (error.response) {
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            console.error('Network Error:', error.request);
        } else {
            console.error('Error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;