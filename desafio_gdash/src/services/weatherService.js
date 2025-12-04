import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Adiciona o token em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const weatherService = {
  // Buscar todos os registros
  async getAllLogs(limit = 100) {
    const response = await api.get(`/api/weather/logs?limit=${limit}`);
    return response.data;
  },

  // Buscar registros recentes (últimas N horas)
  async getRecentLogs(hours = 24) {
    const response = await api.get(`/api/weather/recent?hours=${hours}`);
    return response.data;
  },

  // Buscar estatísticas
  async getStats() {
    const response = await api.get('/api/weather/stats');
    return response.data;
  },

  // Enviar novo registro (usado para testes)
  async createLog(data) {
    const response = await api.post('/api/weather/logs', data);
    return response.data;
  },
};

export default api;
