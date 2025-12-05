import axios from "axios";

const DEFAULT = "http://localhost:3000";
const base = import.meta.env.VITE_API_URL ?? DEFAULT;

const api = axios.create({
  baseURL: base, // e.g. http://nestjs:3000
  timeout: 10000,
});

export default api;