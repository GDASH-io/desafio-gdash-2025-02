import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3000', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gdash_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});