import axios from 'axios';

const envBase = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
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
