import axios from "axios";
import { env } from "../config/env";

export const httpClient = axios.create(
  {
    baseURL: env.API_URL
  }
);


httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("gdash:authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});