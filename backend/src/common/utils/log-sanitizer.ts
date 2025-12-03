/**
 * Utilitário para sanitizar logs e evitar expor informações sensíveis
 */

const SENSITIVE_FIELDS = [
  'password',
  'token',
  'secret',
  'authorization',
  'auth',
  'jwt',
  'apiKey',
  'api_key',
  'accessToken',
  'refreshToken',
];

/**
 * Remove campos sensíveis de um objeto antes de logar
 */
export function sanitizeForLogging<T extends Record<string, any>>(
  obj: T
): Partial<T> {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  const sanitized: any = { ...obj };

  for (const key in sanitized) {
    const lowerKey = key.toLowerCase();

    // Verificar se o campo é sensível
    if (SENSITIVE_FIELDS.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Recursivamente sanitizar objetos aninhados
      sanitized[key] = sanitizeForLogging(sanitized[key] as Record<string, any>);
    }
  }

  return sanitized as Partial<T>;
}

/**
 * Sanitiza uma string que pode conter informações sensíveis
 */
export function sanitizeString(str: string): string {
  if (!str || typeof str !== 'string') {
    return str;
  }

  // Padrões comuns de tokens e senhas
  const patterns = [
    /password["\s:=]+([^"}\s,]+)/gi,
    /token["\s:=]+([^"}\s,]+)/gi,
    /secret["\s:=]+([^"}\s,]+)/gi,
    /authorization["\s:=]+([^"}\s,]+)/gi,
    /Bearer\s+([^\s"']+)/gi,
  ];

  let sanitized = str;
  patterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, (match, value) => {
      return match.replace(value, '[REDACTED]');
    });
  });

  return sanitized;
}

