import axios from 'axios';

const getApiBaseUrl = () => {
  // 1. Priority: Environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    let url = process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    return url.endsWith('/api') ? url + '/' : url + '/api/';
  }

  // 2. Dynamic switching based on environment
  if (typeof window !== 'undefined') {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return isLocal 
      ? 'http://localhost:5000/api/' 
      : 'https://g-tiles-bro-backend.onrender.com/api/';
  }

  // 3. Server-side default
  return 'http://localhost:5000/api/';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 — clear token and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
