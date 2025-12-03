export interface WeatherLog {
  _id?: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  city?: string;
}

export interface User {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  role?: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface WeatherInsights {
  message?: string; // Presente quando não há dados suficientes
  summary: string;
  statistics?: {
    averageTemperature: number;
    averageHumidity: number;
    maxTemperature: number;
    minTemperature: number;
    maxHumidity: number;
    minHumidity: number;
    temperatureTrend: string;
  };
  comfortScore?: number;
  dayClassification?: string;
  alerts?: string[];
  dataPoints?: number;
}

/**
 * Garante que a URL tenha um protocolo válido (http:// ou https://).
 * Se não tiver protocolo, adiciona https:// por padrão (assumindo produção).
 * Para URLs locais (localhost, 127.0.0.1), usa http://
 */
function ensureProtocol(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return trimmed;
  }

  // Se já tem protocolo, retornar como está
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Verificar se é uma URL local que deve usar http://
  const localHosts = ['localhost', '127.0.0.1', 'backend:'];
  for (const host of localHosts) {
    if (trimmed.startsWith(host)) {
      return `http://${trimmed}`;
    }
  }

  // Se contém "backend" no início e não tem ponto (provavelmente nome de serviço Docker)
  if (trimmed.startsWith('backend') && !trimmed.includes('.')) {
    return `http://${trimmed}`;
  }

  // Para todas as outras URLs (assumindo produção com domínio externo), usar https://
  return `https://${trimmed}`;
}

// @ts-ignore - Vite provides import.meta.env at runtime
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const API_BASE_URL = ensureProtocol(rawApiUrl);

// Log da URL da API no console para debug
console.log('[frontend] API Base URL configured:', API_BASE_URL);

// Helper para fazer requisições autenticadas
async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    // Token inválido ou expirado
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro HTTP! status: ${response.status}`);
  }
  
  return response;
}

// Auth API
export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Credenciais inválidas' }));
    throw new Error(error.message || 'Erro ao fazer login');
  }

  const data = await response.json();
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}

export async function register(name: string, email: string, password: string): Promise<LoginResponse> {
  const url = `${API_BASE_URL}/auth/register`;
  console.log('[frontend] Attempting to register user:', { email, name, url });
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao registrar' }));
      
      // Tratar mensagens de erro do backend (pode ser array ou string)
      let errorMessage = 'Erro ao registrar';
      if (error.message) {
        if (Array.isArray(error.message)) {
          // Se for array de mensagens de validação, juntar todas
          errorMessage = error.message.join(', ');
        } else {
          errorMessage = error.message;
        }
      }
      
      console.error('[frontend] Registration error:', {
        status: response.status,
        statusText: response.statusText,
        error: error,
        message: errorMessage,
        url: url,
      });
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('[frontend] Registration successful:', { email: data.user?.email });
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  } catch (error) {
    // Tratar erros de rede/CORS
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('[frontend] Network error during registration:', {
        error: error.message,
        url: url,
        apiBaseUrl: API_BASE_URL,
        possibleCauses: [
          'CORS está bloqueando a requisição',
          'Backend não está acessível',
          'URL do backend está incorreta',
          'Verifique se VITE_API_URL está configurado corretamente',
        ],
      });
      throw new Error(
        `Não foi possível conectar ao servidor. Verifique se o backend está rodando e se a URL está correta (${API_BASE_URL}). ` +
        `Se estiver em produção, verifique as configurações de CORS no backend.`
      );
    }
    // Re-lançar outros erros
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser(): User | null {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export interface PaginatedWeatherLogs {
  data: WeatherLog[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Weather API
export async function getWeatherLogs(limit?: number): Promise<WeatherLog[]> {
  // A API agora sempre retorna formato paginado, então precisamos extrair o array
  // Usar getWeatherLogsPaginated internamente para garantir consistência
  const page = 1;
  const limitNum = limit || 100;
  
  console.log('[frontend] getWeatherLogs: usando getWeatherLogsPaginated internamente');
  
  try {
    const paginatedData = await getWeatherLogsPaginated(page, limitNum);
    
    // Extrair o array da resposta paginada
    if (paginatedData && typeof paginatedData === 'object' && 'data' in paginatedData) {
      const logsArray = Array.isArray(paginatedData.data) ? paginatedData.data : [];
      console.log('[frontend] getWeatherLogs: extraído array com', logsArray.length, 'itens');
      return logsArray;
    }
    
    // Fallback: se não tiver estrutura esperada
    console.warn('[frontend] getWeatherLogs: resposta não tem estrutura esperada:', paginatedData);
    return [];
  } catch (error) {
    console.error('[frontend] getWeatherLogs: erro ao buscar logs:', error);
    return [];
  }
}

export async function getWeatherLogsPaginated(
  page: number = 1,
  limit: number = 10,
  city?: string,
  startDate?: string,
  endDate?: string
): Promise<PaginatedWeatherLogs> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (city) {
    params.append('city', city);
  }
  if (startDate) {
    params.append('startDate', startDate);
  }
  if (endDate) {
    params.append('endDate', endDate);
  }
  
  const url = `${API_BASE_URL}/weather/logs?${params.toString()}`;
  console.log('[frontend] Fetching paginated weather logs from:', url);
  
  const response = await authenticatedFetch(url);
  const data = await response.json();
  console.log('[frontend] Fetched paginated weather logs:', data);
  
  return data;
}

export async function getWeatherInsights(city?: string): Promise<WeatherInsights> {
  const params = new URLSearchParams();
  if (city) {
    params.append('city', city);
  }
  const url = `${API_BASE_URL}/weather/insights${params.toString() ? `?${params.toString()}` : ''}`;
  console.log('[frontend] Fetching weather insights from:', url);
  
  const response = await authenticatedFetch(url);
  const data = await response.json();
  console.log('[frontend] Fetched weather insights:', data);
  
  return data;
}

export async function getAvailableCities(): Promise<string[]> {
  const url = `${API_BASE_URL}/weather/cities`;
  console.log('[frontend] Fetching available cities from:', url);
  
  const response = await authenticatedFetch(url);
  const data = await response.json();
  console.log('[frontend] Fetched available cities:', data);
  
  return data;
}

export async function exportCsv(): Promise<Blob> {
  const url = `${API_BASE_URL}/weather/export.csv`;
  const response = await authenticatedFetch(url);
  return response.blob();
}

export async function exportXlsx(): Promise<Blob> {
  const url = `${API_BASE_URL}/weather/export.xlsx`;
  const response = await authenticatedFetch(url);
  return response.blob();
}

// Users API
export async function getUsers(): Promise<User[]> {
  const url = `${API_BASE_URL}/users`;
  const response = await authenticatedFetch(url);
  return response.json();
}

export async function createUser(user: { name: string; email: string; password: string; role?: string }): Promise<User> {
  const url = `${API_BASE_URL}/users`;
  const response = await authenticatedFetch(url, {
    method: 'POST',
    body: JSON.stringify(user),
  });
  return response.json();
}

export async function updateUser(id: string, user: Partial<User & { password?: string }>): Promise<User> {
  const url = `${API_BASE_URL}/users/${id}`;
  const response = await authenticatedFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(user),
  });
  return response.json();
}

export async function changePassword(id: string, password: string): Promise<void> {
  const url = `${API_BASE_URL}/users/${id}/password`;
  await authenticatedFetch(url, {
    method: 'PATCH',
    body: JSON.stringify({ password }),
  });
}

export async function deleteUser(id: string): Promise<void> {
  const url = `${API_BASE_URL}/users/${id}`;
  await authenticatedFetch(url, {
    method: 'DELETE',
  });
}

// Games API (RAWG)
export interface Game {
  id: number;
  name: string;
  image: string;
  platforms: string[];
  genres: string[];
  rating: number;
  ratingTop: number;
  ratingsCount: number;
  released: string;
  developers: string[];
  screenshots: string[];
}

export interface GameDetails extends Omit<Game, 'platforms'> {
  description: string;
  platforms: Array<{ name: string; releasedAt?: string }>;
  publishers: string[];
  metacritic?: number;
  website?: string;
  esrbRating?: string;
}

export interface PaginatedGames {
  data: Game[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Platform {
  id: number;
  name: string;
}

export async function getGames(
  page: number = 1,
  limit: number = 20,
  platform?: string,
  search?: string,
): Promise<PaginatedGames> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (platform) {
    params.append('platform', platform);
  }
  
  if (search) {
    params.append('search', search);
  }
  
  const url = `${API_BASE_URL}/games?${params.toString()}`;
  console.log('[frontend] Fetching games from:', url);
  
  const response = await authenticatedFetch(url);
  const data = await response.json();
  console.log('[frontend] Fetched games:', data);
  
  return data;
}

export async function getGameById(id: number): Promise<GameDetails> {
  const url = `${API_BASE_URL}/games/${id}`;
  console.log('[frontend] Fetching game details from:', url);
  
  const response = await authenticatedFetch(url);
  const data = await response.json();
  console.log('[frontend] Fetched game details:', data);
  
  return data;
}

export async function getPlatforms(): Promise<Platform[]> {
  const url = `${API_BASE_URL}/games/platforms`;
  console.log('[frontend] Fetching platforms from:', url);
  
  const response = await authenticatedFetch(url);
  const data = await response.json();
  console.log('[frontend] Fetched platforms:', data);
  
  return data;
}

