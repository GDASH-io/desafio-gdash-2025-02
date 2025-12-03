/**
 * Utilitários para formatação de datas
 */

/**
 * Formata um timestamp ISO para formato brasileiro completo.
 *
 * @param timestamp - String de timestamp ISO (ex: "2025-01-24T10:00:00Z")
 * @returns String formatada (ex: "24/01/2025, 10:00:00")
 */
export function formatDate(timestamp: string): string {
  try {
    return new Date(timestamp).toLocaleString('pt-BR');
  } catch {
    return timestamp;
  }
}

/**
 * Formata um timestamp ISO para formato de hora curto (HH:MM).
 *
 * @param timestamp - String de timestamp ISO
 * @returns String formatada (ex: "10:00")
 */
export function formatDateShort(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
}

/**
 * Formata um timestamp ISO para formato de data apenas (DD/MM/YYYY).
 *
 * @param timestamp - String de timestamp ISO
 * @returns String formatada (ex: "24/01/2025")
 */
export function formatDateOnly(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return timestamp;
  }
}

