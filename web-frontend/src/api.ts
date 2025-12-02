import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("token") || "";
  const token = raw.trim();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;

    console.log("Axios Request - URL:", config.url);
    console.log("Axios Request - Authorization header:", config.headers.Authorization);
  } else {
    console.log("Axios Request (sem token) - URL:", config.url);
  }
  return config;
}, (error) => {
  console.error("Axios Request Error:", error);
  return Promise.reject(error);
});

api.interceptors.response.use((resp) => {
  console.log("Axios Response success:", resp.status, resp.config.url);
  return resp;
}, (error) => {
  console.error("Axios Response error:", error.response?.status, error.config?.url, error.response?.data);
  return Promise.reject(error);
});

export default api;
