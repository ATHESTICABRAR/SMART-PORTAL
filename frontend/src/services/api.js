import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('sap_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Auto logout if token expired or unauthorized (unless on login route)
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('sap_token');
        localStorage.removeItem('sap_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
