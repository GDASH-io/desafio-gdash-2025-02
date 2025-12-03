/**
 * Utilitários para formatação e manipulação de datas
 */

/**
 * Formata uma data para o formato ISO 8601
 *
 * @param date - Data a ser formatada (padrão: agora)
 * @returns String no formato ISO 8601 (ex: "2025-01-24T10:00:00Z")
 */
export function formatToISO(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * Valida se uma string é uma data válida no formato ISO
 *
 * @param dateString - String a ser validada
 * @returns true se for uma data válida
 */
export function isValidISODate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.includes('T');
}

/**
 * Formata uma data para exibição em português brasileiro
 *
 * @param dateString - String de data ISO
 * @returns String formatada (ex: "24/01/2025, 10:00:00")
 */
export function formatToBrazilian(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return dateString;
    }
    return date.toLocaleString('pt-BR');
  } catch {
    return dateString;
  }
}

