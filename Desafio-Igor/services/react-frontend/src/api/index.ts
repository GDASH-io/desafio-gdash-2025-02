import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),
};

// Weather API
export const weatherAPI = {
  getAll: (limit = 100, city?: string) =>
    api.get("/weather", { params: { limit, city } }),

  getStatistics: () => api.get("/weather/statistics"),

  getInsights: () => api.get("/weather/insights"),

  exportCSV: () => api.get("/weather/export/csv", { responseType: "blob" }),

  exportExcel: () => api.get("/weather/export/xlsx", { responseType: "blob" }),
};

// Users API
export const usersAPI = {
  getAll: () => api.get("/users"),

  getById: (id: string) => api.get(`/users/${id}`),

  update: (id: string, data: any) => api.put(`/users/${id}`, data),

  delete: (id: string) => api.delete(`/users/${id}`),
};

export const pokemonAPI = {
  getList: (limit: number, offset: number) =>
    api.get(`/pokemon?limit=${limit}&offset=${offset}`),
  getById: (id: number) => api.get(`/pokemon/${id}`),
};
