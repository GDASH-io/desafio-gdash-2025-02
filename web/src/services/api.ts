import axios from 'axios'

// Constantes de configuração
const DEFAULT_API_URL = 'http://localhost:3000'
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL
// prefer the modern 'token' key first (login writes 'token'), fallback to legacy 'authToken'
const TOKEN_KEYS = ['token', 'authToken']
const USER_STORAGE_KEYS = ['token', 'authToken', 'user']

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
})

// Funções auxiliares
const getStoredToken = (): string | null => {
  for (const key of TOKEN_KEYS) {
    const token = localStorage.getItem(key)
    if (token) return token
  }
  return null
}

const clearUserData = (): void => {
  USER_STORAGE_KEYS.forEach(key => {
    localStorage.removeItem(key)
  })
}

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearUserData()
      console.warn('Token expired, will retry with auto-login')
    }
    
    // Log de erros para debug
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      })
    } else if (error.request) {
      console.error('Network Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)