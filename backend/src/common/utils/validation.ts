/**
 * Utilitários para validação de dados
 */

/**
 * Valida se um valor é um número válido
 *
 * @param value - Valor a ser validado
 * @returns true se for um número válido
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Valida se um valor é uma string não vazia
 *
 * @param value - Valor a ser validado
 * @returns true se for uma string não vazia
 */
export function isValidString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Valida se um email tem formato válido
 *
 * @param email - Email a ser validado
 * @returns true se o formato for válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitiza uma string removendo caracteres perigosos
 *
 * @param input - String a ser sanitizada
 * @returns String sanitizada
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

