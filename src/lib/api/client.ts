import axios from 'axios';

const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});



// リクエストインターセプター
apiClient.interceptors.request.use(
    (config) => {
        // const token = localStorage.getItem('token');

        // if (token) {
        //     config.headers.Authorization = `Bearer ${token}`;
        // }

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
        return Promise.reject(error);
    }
);

export default apiClient;