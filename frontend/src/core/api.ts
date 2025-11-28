import axios from 'axios'
import { getFromStorage } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const api = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    },
})


api.interceptors.request.use((config) => {
    const token = getFromStorage<string>('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export interface User {
    id: string
    nome: string
    email: string
    senha?: string
    funcao?: string
    createdAt?: string
}

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    token: string
    user: User
}

export interface WeatherData {
    _id: string
    temperatura: number
    umidade: number
    vento: number
    condicao: string
    probabilidade_chuva: number
    data_coleta: string
    cidade: string
    createdAt: string
    updatedAt: string
    __v: number
}

export interface WeatherInsight {
    estatisticas: {
        temperatura: { media: number; max: number; min: number }
        umidade: { media: number; max: number; min: number }
        vento: { media: number; max: number; min: number }
        probabilidade_chuva: { media: number; max: number; min: number }
    }
    conforto_climatico: number
    resumo: string
    analise_tecnica: string
}

export interface ChartDataPoint {
    data_coleta: string
    temperatura?: number
    probabilidade_chuva?: number
}


export const authAPI = {
    login: async (credentials: LoginRequest): Promise<LoginResponse> => {
        const response = await api.post('/auth/login', credentials)
        return response.data
    },

    logout: async (): Promise<void> => {
        await api.post('/auth/logout')
    },

    me: async (): Promise<User> => {
        const response = await api.get('/auth/me')
        return response.data
    },
}

export const weatherAPI = {
    getAll: async (): Promise<WeatherData[]> => {
        const response = await api.get('/weather/logs')
        return response.data
    },

    getById: async (id: string): Promise<WeatherData> => {
        const response = await api.get(`/weather/${id}`)
        return response.data
    },

    getChartData: async (): Promise<ChartDataPoint[]> => {
        const response = await api.get('/weather/logs')
        return response.data
    },

    getInsights: async (): Promise<WeatherInsight[]> => {
        const response = await api.post('/weather/insights')
        return response.data
    },

    exportCSV: async (): Promise<Blob> => {
        const response = await api.get('/weather/export-csv', {
            responseType: 'blob',
        })
        return response.data
    },

    exportXLSX: async (): Promise<Blob> => {
        const response = await api.get('/weather/export-xlsx', {
            responseType: 'blob',
        })
        return response.data
    },
}

export const usersAPI = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get('/users')
        return response.data
    },

    getById: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`)
        return response.data
    },

    create: async (user: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
        const response = await api.post('/users', {
            nome: user.nome,
            email: user.email,
            funcao: user.funcao,
            senha: user.senha,
        });
        return response.data;
    },

    update: async (id: string, user: Partial<User>): Promise<User> => {
        const response = await api.put(`/users/${id}`, user)
        return response.data
    },

    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`)
    },
}

export interface Pokemon {
    name: string
    url: string
    id?: number
    sprites?: {
        front_default: string
    }
    types?: Array<{ type: { name: string } }>
    height?: number
    weight?: number
}

export interface PokemonListResponse {
    count: number
    next: string | null
    previous: string | null
    results: Pokemon[]
}

export const pokemonAPI = {
    getList: async (offset = 0, limit = 20): Promise<PokemonListResponse> => {
        const response = await axios.get(
            `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
        )
        return response.data
    },

    getByName: async (name: string): Promise<Pokemon> => {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
        return response.data
    },
}
