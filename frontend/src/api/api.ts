import axios, { AxiosError } from 'axios'
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10 * 1000,
  withCredentials: true,
})

api.interceptors.response.use((response) => {
  return response
}, (error:AxiosError<{success: boolean, message: string}>) => {
  console.log(error)
  const isVerifyRoute = error.config?.url?.includes("/user/me")
  if(isVerifyRoute) return error
  if(error.response?.data.message) {
    toast.error(error.response.data.message);
  } else {
    toast.error("Erro interno")
  }
  return Promise.reject(error)
})