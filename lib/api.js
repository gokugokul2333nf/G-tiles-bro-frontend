import axios from 'axios';

const getApiBaseUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'https://g-tiles-bro-backend.onrender.com/api/';
  // Normalize: remove trailing slash
  url = url.replace(/\/$/, '');
  // Force /api suffix if missing
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  // Return with trailing slash for Axios relative calls
  return url + '/';
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
