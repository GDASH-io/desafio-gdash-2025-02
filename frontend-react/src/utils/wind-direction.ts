/**
 * Utilitário para trabalhar com direção do vento
 */

/**
 * Converte graus (0-360) para direção cardinal
 */
export function degreesToCardinal(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Obtém o ícone de seta para direção do vento
 */
export function getWindDirectionArrow(degrees: number): string {
  // Converter graus para emoji de seta
  const arrows = ['↓', '↙', '←', '↖', '↑', '↗', '→', '↘'];
  const index = Math.round(degrees / 45) % 8;
  return arrows[index];
}

/**
 * Obtém a rotação CSS para o ícone de direção
 */
export function getWindDirectionRotation(degrees: number): number {
  // Ajustar para que N (0°) aponte para cima
  return degrees;
}

