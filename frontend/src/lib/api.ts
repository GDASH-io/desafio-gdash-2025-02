import axios, { InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

// Interceptador de Requisição (Adiciona o Token)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem("token");

  if (token) {
    // O Axios v1+ exige que headers sejam tratados como objeto ou Headers map
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});

// Interceptador de Resposta (Trata erros globais)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Se der erro de autenticação, limpa tudo e redireciona
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;
