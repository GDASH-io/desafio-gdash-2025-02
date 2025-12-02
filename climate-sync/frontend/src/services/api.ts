import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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
export interface User {
  _id: string
  name: string
  email: string
}

export interface CreateUserDto {
  name: string
  email: string
  password: string
}

export interface UpdateUserDto {
  name?: string
  email?: string
  password?: string
}

export interface Character {
  id: number
  name: string
  status: string
  species: string
  type: string
  gender: string
  origin: {
    name: string
    url: string
  }
  location: {
    name: string
    url: string
  }
  image: string
  episode: string[]
  url: string
  created: string
}

export interface RickAndMortyResponse {
  info: {
    count: number
    pages: number
    next: string | null
    prev: string | null
  }
  results: Character[]
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
    api.get<BackendInsightsResponse>('/weather/insights').then((res: { data: any }) => res.data),
}

export const userApi = {
  getAll: () => api.get<User[]>('/users').then(res => res.data),
  create: (data: CreateUserDto) => api.post<User>('/users', data).then(res => res.data),
  patch: (id: string, data: UpdateUserDto) => api.patch<User>(`/users/${id}`, data).then(res => res.data),
  delete: (id: string) => api.delete(`/users/${id}`).then(res => res.data),
}

export const rickAndMortyApi = {
  getCharacters: (page: number = 1) => 
    api.get<RickAndMortyResponse>(`/rick-and-morty/characters?page=${page}`).then(res => res.data),
}

export const REALTIME_WEATHER_URL = `${api.defaults.baseURL}/weather/realtime`
