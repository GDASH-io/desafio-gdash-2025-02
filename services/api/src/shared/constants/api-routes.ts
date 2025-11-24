export const API_ROUTES = {
  AUTH: {
    BASE: 'auth',
    LOGIN: 'login',
  },
  USERS: {
    BASE: 'users',
    BY_ID: ':id',
  },
  WEATHER: {
    BASE: 'weather',
    LOGS: 'logs',
    EXPORT: 'export',
  },
  INSIGHTS: {
    BASE: 'insights',
    GENERATE: 'generate',
  },
} as const;
