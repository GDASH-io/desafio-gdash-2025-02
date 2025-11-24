export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Credenciais inválidas',
    UNAUTHORIZED: 'Não autorizado',
    TOKEN_EXPIRED: 'Token expirado',
    TOKEN_INVALID: 'Token inválido',
  },
  USERS: {
    NOT_FOUND: 'Usuário não encontrado',
    EMAIL_ALREADY_EXISTS: 'Email já cadastrado',
    INVALID_EMAIL: 'Email inválido',
    WEAK_PASSWORD: 'Senha muito fraca',
  },
  WEATHER: {
    NOT_FOUND: 'Dados meteorológicos não encontrados',
    INVALID_LOCATION: 'Localização inválida',
    API_ERROR: 'Erro ao buscar dados meteorológicos',
  },
  INSIGHTS: {
    GENERATION_FAILED: 'Falha ao gerar insights',
    NO_DATA: 'Dados insuficientes para gerar insights',
    API_LIMIT: 'Limite de requisições da API atingido',
  },
  COMMON: {
    INTERNAL_SERVER_ERROR: 'Erro interno do servidor',
    BAD_REQUEST: 'Requisição inválida',
    VALIDATION_FAILED: 'Falha na validação dos dados',
  },
} as const;
