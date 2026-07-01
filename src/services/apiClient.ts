import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://raizbosquebackend.onrender.com/api';
const API_TIMEOUT_MS = Number(process.env.EXPO_PUBLIC_API_TIMEOUT_MS ?? 45000);

console.log('[apiClient] baseURL:', BASE_URL);
console.log('[apiClient] timeoutMs:', API_TIMEOUT_MS);

export const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: API_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            console.error(`[apiClient] Timeout — el servidor tardó más de ${API_TIMEOUT_MS} ms en responder`);
        } else if (!error.response) {
            console.error('[apiClient] Sin respuesta del servidor (Network Error o servidor apagado)');
        }
        console.error('[apiClient] Error:', error.message, 'code=', error.code || 'N/A');
        if (error.config) {
            console.error('[apiClient] URL:', error.config.baseURL + error.config.url);
        }
        if (error.response) {
            console.error('[apiClient] Status:', error.response.status, error.response.data);
        }
        return Promise.reject(error);
    },
);
