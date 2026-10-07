import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://healthcare-system-backend-qyti.onrender.com/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('atrium_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response && err.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login';
        }
        return Promise.reject(err);
    }
);

export function extractErrorMessage(error: any): string {
    if (typeof error === 'string') return error;
    if (error?.response?.data?.message) return error.response.data.message;
    if (typeof error?.response?.data === 'string') return error.response.data;
    if (error?.message) return error.message;
    return 'An unexpected error occurred. Please try again.';
}

export default api;