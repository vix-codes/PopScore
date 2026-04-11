import axios from 'axios';

const productionApiFallback = 'https://popscore-production-7293.up.railway.app';
const envBase = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? productionApiFallback : '')
)
  .trim()
  .replace(/\/$/, '');
const baseURL = envBase ? `${envBase}/api` : '/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
