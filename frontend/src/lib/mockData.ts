// Mock data para desenvolvimento/testes quando a API não estiver disponível
// Use este arquivo importando em src/services/api.ts quando necessário

export const mockWeatherData = [
    {
        id: '1',
        location: 'São Paulo, SP',
        temperature: 25.5,
        humidity: 65,
        windSpeed: 12,
        condition: 'Sunny',
        timestamp: '2025-11-25T10:00:00Z',
    },
    {
        id: '2',
        location: 'Rio de Janeiro, RJ',
        temperature: 28.3,
        humidity: 78,
        windSpeed: 8,
        condition: 'Partly Cloudy',
        timestamp: '2025-11-25T10:05:00Z',
    },
    {
        id: '3',
        location: 'Brasília, DF',
        temperature: 23.1,
        humidity: 45,
        windSpeed: 15,
        condition: 'Clear',
        timestamp: '2025-11-25T10:10:00Z',
    },
    {
        id: '4',
        location: 'Salvador, BA',
        temperature: 27.8,
        humidity: 82,
        windSpeed: 10,
        condition: 'Rainy',
        timestamp: '2025-11-25T10:15:00Z',
    },
    {
        id: '5',
        location: 'Curitiba, PR',
        temperature: 18.5,
        humidity: 70,
        windSpeed: 18,
        condition: 'Cloudy',
        timestamp: '2025-11-25T10:20:00Z',
    },
]

export const mockChartData = [
    { time: '00:00', temperature: 22, rainProbability: 10 },
    { time: '03:00', temperature: 20, rainProbability: 15 },
    { time: '06:00', temperature: 19, rainProbability: 20 },
    { time: '09:00', temperature: 23, rainProbability: 25 },
    { time: '12:00', temperature: 26, rainProbability: 30 },
    { time: '15:00', temperature: 27, rainProbability: 40 },
    { time: '18:00', temperature: 24, rainProbability: 50 },
    { time: '21:00', temperature: 21, rainProbability: 35 },
]

export const mockInsights = [
    {
        id: '1',
        message: 'Alta probabilidade de chuva nas próximas 6 horas. Recomenda-se levar guarda-chuva.',
        type: 'warning' as const,
        createdAt: '2025-11-25T10:00:00Z',
    },
    {
        id: '2',
        message: 'Temperatura agradável durante o dia. Clima ideal para atividades ao ar livre.',
        type: 'success' as const,
        createdAt: '2025-11-25T09:30:00Z',
    },
    {
        id: '3',
        message: 'Ventos fortes esperados à tarde. Tome precauções se estiver em áreas abertas.',
        type: 'alert' as const,
        createdAt: '2025-11-25T09:00:00Z',
    },
    {
        id: '4',
        message: 'Umidade elevada pode causar desconforto. Mantenha-se hidratado.',
        type: 'info' as const,
        createdAt: '2025-11-25T08:30:00Z',
    },
]

export const mockUsers = [
    {
        id: '1',
        name: 'João Silva',
        email: 'joao@example.com',
        role: 'Admin',
        createdAt: '2025-01-15T10:00:00Z',
    },
    {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@example.com',
        role: 'User',
        createdAt: '2025-02-20T14:30:00Z',
    },
    {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@example.com',
        role: 'User',
        createdAt: '2025-03-10T09:15:00Z',
    },
    {
        id: '4',
        name: 'Ana Oliveira',
        email: 'ana@example.com',
        role: 'Moderator',
        createdAt: '2025-04-05T16:45:00Z',
    },
]

export const mockLoginResponse = {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFVzZXIiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    user: {
        id: '1',
        name: 'Admin User',
        email: 'admin@weather.com',
        role: 'Admin',
    },
}

// Função helper para simular delay de API
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Exemplo de uso nos hooks:
/*
export const useWeatherData = () => {
  return useQuery({
    queryKey: ['weather'],
    queryFn: async () => {
      await delay(500) // Simula latência de rede
      return mockWeatherData
    },
    refetchInterval: 60000,
  })
}
*/
