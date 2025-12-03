/**
 * Utilitários para validação e transformação de arrays
 */

/**
 * Garante que o valor seja sempre um array, mesmo que seja null, undefined ou outro tipo.
 * Útil para evitar erros de tipo em componentes React.
 *
 * @param value - Valor a ser verificado
 * @returns Array garantido (vazio se o valor não for um array válido)
 *
 * @example
 * ```ts
 * const logs = ensureArray(apiResponse.data); // Sempre retorna um array
 * ```
 */
export function ensureArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value;
  }

  if (value && typeof value === 'object' && 'data' in value) {
    const data = (value as { data: unknown }).data;
    if (Array.isArray(data)) {
      return data;
    }
  }

  return [];
}

/**
 * Extrai um array de um objeto paginado ou retorna o array diretamente.
 *
 * @param value - Valor que pode ser um array ou objeto paginado
 * @returns Array extraído ou array vazio
 */
export function extractArrayFromPaginated<T>(
  value: unknown
): { data: T[]; pagination: any | null } {
  if (Array.isArray(value)) {
    return { data: value, pagination: null };
  }

  if (value && typeof value === 'object' && 'data' in value) {
    const paginated = value as { data: unknown; [key: string]: unknown };
    const data = Array.isArray(paginated.data) ? paginated.data : [];
    return { data, pagination: value };
  }

  return { data: [], pagination: null };
}

