import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar o token em todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Redireciona para login apenas se não estiver já na página de login/register
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user?: {
    id: string
    email: string
    name: string
  }
}

export interface WeatherData {
  windSpeed: number
  id: string
  timestamp: string
  temperature: number
  humidity: number
  city: string
}

export interface DashboardMetrics {
  windSpeed(windSpeed: any): string | number
  avgTemperature: number
  avgHumidity: number
  avgWindSpeed: number
  totalRecords: number
}

export interface AnalyticsData {
  temperatureRanges: {
    range: string
    count: number
  }[]
}

export interface AIInsight {
  type: string
  category: string
  message: string
}

// Estrutura real retornada pelo backend
export interface BackendInsightsResponse {
  data: {
    summary: string
    details: AIInsight[]
    generated_at: string
    context: {
      dataPointsAnalyzed: number
    }
  }
}

// Estrutura normalizada para uso no frontend
export interface NormalizedInsightsResponse {
  insights: AIInsight[]
  generatedAt: string
  summary: string
  context?: {
    dataPointsAnalyzed: number
  }
}


// API Methods
export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post<AuthResponse>('/auth/login', credentials).then(res => res.data),
  register: (data: RegisterData) =>
    api.post<AuthResponse>('/auth/register', data).then(res => res.data),
}

export const weatherApi = {
  getAll: () => api.get<WeatherData[]>('/weather').then(res => res.data),
  getDashboard: () =>
    api.get<{ data: DashboardMetrics }>('/dashboard').then(res => res.data),
  getAnalytics: () =>
    api.get<{ data: AnalyticsData }>('/analytics').then(res => res.data),
  getInsights: () =>
    api.get<BackendInsightsResponse>('/weather/insights').then(res => res.data),
}

export const REALTIME_WEATHER_URL = `${api.defaults.baseURL}/weather/realtime`
