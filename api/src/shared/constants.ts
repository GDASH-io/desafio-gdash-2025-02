export const envVariables = {
  JWT_SECRET: 'JWT_SECRET',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  FALLBACK_GEMINI_API_KEY: 'FALLBACK_GEMINI_API_KEY',
  FALLBACK_GEMINI_MODEL: 'FALLBACK_GEMINI_EMBEDDING_MODEL',
  FALLBACK_GEMINI_EMBEDDING_MODEL: 'FALLBACK_GEMINI_EMBEDDING_MODEL',
  OPENAI_MODEL: 'OPENAI_MODEL',
  OPENAI_EBEDDING_MODEL: 'OPENAI_EBEDDING_MODEL',
  MONGO_URI: 'MONGO_URI',
  PORT: 'PORT',
  PUBLIC_API_URL: 'PUBLIC_API_URL',
};

export const publicUrlConfigConstants = {
  LIMIT: 10,
};

export const mongoDBConstants = {
  DATABASE_CONNECTION: 'DATABASE_CONNECTION',
  collections: {
    WEATHER_COLLECTION: 'Weather',
    USER_COLLECTION: 'User',
  },
  models: {
    WEATHER_MODEL: 'WEATHER_MODEL',
    USER_MODEL: 'USER_MODEL',
  },
};

export const commonConstants = {
  decorators: {
    IS_PUBLIC: 'IS_PUBLIC',
    ROLES_KEY: 'ROLES',
  },
  ports: {
    USERS: 'UserRepositoryPort',
    WEATHER: 'WeatherRepositoryPort',
    SPREADSHEET: 'SpreadsheetAdapterPort',
    EXPLORER: 'ExplorerAdapterPort',
    ENCRYPT: 'EncryptAdapterPort',
    AUTH: 'AuthRepositoryPort',
    ANALYTICS: 'AnalyticsPort',
    OPENAI: 'OpenAiAdapterPort',
    GEMINI: 'GeminiAdapterPort',
  },
};
