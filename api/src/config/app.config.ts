export const appConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  env: process.env.NODE_ENV || 'development',
  apiPrefix: 'api',
  cors: {
    enabled: true,
    origin: process.env.CORS_ORIGIN || '*',
  },
};
