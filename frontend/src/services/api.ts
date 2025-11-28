const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface WeatherLog {
  _id: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  radiation: number;
  weather_code: number;
  timestamp: string;
  location: { 
    lat: number; 
    lon: number; 
  };
}

export interface AuthResponse {
  access_token: string;
}

export interface InsightResponse {
  insight: string;
  logs_analyzed: number;
}

// Classe de erro personalizada para facilitar a detecção
class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const api = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'Falha no login');
    }
    
    return res.json();
  },

  getLogs: async (token: string, date?: string): Promise<WeatherLog[]> => {
    const query = date ? `?date=${date}` : '';
    
    const res = await fetch(`${API_URL}/weather/logs${query}`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (res.status === 401) {
      throw new ApiError('Sessão expirada', 401);
    }

    if (!res.ok) throw new Error('Erro ao buscar logs climáticos');
    return res.json();
  },

  getInsight: async (token: string, date?: string): Promise<InsightResponse> => {
    const query = date ? `?date=${date}` : '';
    
    const res = await fetch(`${API_URL}/weather/insight-now${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.status === 401) throw new ApiError('Sessão expirada', 401);
    if (!res.ok) throw new Error('Erro ao gerar insight de IA');
    return res.json();
  },

  downloadFile: async (token: string, type: 'csv' | 'xlsx') => {
    const endpoint = type === 'csv' ? '/weather/export.csv' : '/weather/export.xlsx';
    
    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 401) {
      alert("Sessão expirada. Por favor, faça login novamente.");
      window.location.reload(); 
      return;
    }

    if (!res.ok) throw new Error('Falha no download do arquivo');
    
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gdash_clima.${type}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  }
};