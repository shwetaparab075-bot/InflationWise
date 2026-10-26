import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return '/api';
  let clean = envUrl.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api')) {
    clean += '/api';
  }
  return clean;
};

const adminApi = axios.create({
  baseURL: getBaseUrl(),
  headers: { 'Content-Type': 'application/json' },
});

export const ADMIN_TOKEN_KEY = 'inflationwise_admin_token';

export const readAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);

export const storeAdminToken = (token, remember) => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  if (remember) localStorage.setItem(ADMIN_TOKEN_KEY, token);
  else sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
};

adminApi.interceptors.request.use((config) => {
  const token = readAdminToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error.config?.url || '');
    const isAuthAttempt = url.includes('/admin/login') || url.includes('/admin/register') || url.includes('/admin/forgot-password');
    if (error.response?.status === 401 && !isAuthAttempt) clearAdminToken();
    return Promise.reject(error);
  }
);

export default adminApi;
