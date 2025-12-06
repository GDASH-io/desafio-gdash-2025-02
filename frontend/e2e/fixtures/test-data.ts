export const mockWeatherLogs = [
  {
    city: 'São Paulo',
    temperature: 25.5,
    humidity: 65,
    windSpeed: 12.3,
    condition: 'Partly Cloudy',
    timestamp: Math.floor(Date.now() / 1000) - 3600,
  },
  {
    city: 'São Paulo',
    temperature: 24.8,
    humidity: 68,
    windSpeed: 10.5,
    condition: 'Cloudy',
    timestamp: Math.floor(Date.now() / 1000) - 7200,
  },
  {
    city: 'São Paulo',
    temperature: 26.2,
    humidity: 62,
    windSpeed: 15.1,
    condition: 'Sunny',
    timestamp: Math.floor(Date.now() / 1000) - 10800,
  },
];

export const mockInsights = {
  insight: 'The weather is expected to remain stable with moderate temperatures and humidity levels.',
  averageTemp: 25.5,
  timestamp: Math.floor(Date.now() / 1000),
};

export const mockUsers = [
  {
    _id: '1',
    email: 'admin@example.com',
    createdAt: new Date('2024-01-01').toISOString(),
  },
  {
    _id: '2',
    email: 'user@example.com',
    createdAt: new Date('2024-01-15').toISOString(),
  },
];

export const mockAuthResponse = {
  access_token: 'mock-jwt-token-12345',
};

export const testCredentials = {
  valid: {
    email: 'test@example.com',
    password: 'password123',
  },
  invalid: {
    email: 'wrong@example.com',
    password: 'wrongpassword',
  },
};
