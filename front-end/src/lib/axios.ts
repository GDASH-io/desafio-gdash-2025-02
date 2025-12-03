import axios from "axios";

export const Axios = axios.create({
  baseURL: "https://gdash-api.onrender.com",
  timeout: 10000,
  headers: {'X-Custom-Header': 'foobar'}
});