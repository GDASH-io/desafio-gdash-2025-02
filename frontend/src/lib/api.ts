import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000/api/v1",
});

api.interceptors.request.use((configRequest) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    configRequest.headers.Authorization = `Bearer ${token}`;
  }
  return configRequest;
});
