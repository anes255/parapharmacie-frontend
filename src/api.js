import axios from 'axios';

const API_URL = 'https://parapharmacie-gaher.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shifa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('shifa_token');
      localStorage.removeItem('shifa_user');
    }
    return Promise.reject(error);
  }
);

export const BACKEND_URL = 'https://parapharmacie-gaher.onrender.com';
export default api;
