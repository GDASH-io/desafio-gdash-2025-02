const isDevelopment = process.env.NODE_ENV === 'development';

export const helmetConfig = () => {
  if (isDevelopment) {
    return {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    };
  }
  return {};
};
