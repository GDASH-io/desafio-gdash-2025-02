// src/services/api.js
import axios from "axios";

const DEFAULT_API = "http://localhost:3000"; // fallback para dev local (navegador)
const baseURL = import.meta.env.VITE_API_URL ?? DEFAULT_API;

// cria instância axios
const api = axios.create({
  baseURL: baseURL + "/api", // ajusta para prefixo /api se seu backend usa /api
  timeout: 10000,
});

// exemplo de interceptor para enviar token
api.interceptors.request.use((config) => {
  // se você eu tiver auth token, pode puxar de localStorage
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (err) => Promise.reject(err));

export default api;
