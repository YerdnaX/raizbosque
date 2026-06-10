import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000/api';

console.log('[apiClient] baseURL:', BASE_URL);

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[apiClient] Error:', error.message);
        if (error.config) {
            console.error('[apiClient] URL:', error.config.baseURL + error.config.url);
        }
        if (error.response) {
            console.error('[apiClient] Status:', error.response.status, error.response.data);
        }
        return Promise.reject(error);
    },
);
