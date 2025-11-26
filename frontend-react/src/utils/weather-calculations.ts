/**
 * Utilitários para cálculos meteorológicos derivados
 */

/**
 * Calcula Sensação Térmica (Heat Index)
 * Fórmula simplificada para temperaturas acima de 27°C
 */
export function calculateHeatIndex(temperatureC: number, humidity: number): number {
  // Fórmula simplificada do Heat Index
  // HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094))
  // Aplicável quando T > 27°C e RH > 40%
  
  if (temperatureC < 27 || humidity < 40) {
    return temperatureC; // Retorna temperatura real se condições não se aplicam
  }

  const T = temperatureC;
  const RH = humidity;

  // Fórmula do Heat Index (Rothfusz)
  const HI = -8.78469475556 +
    1.61139411 * T +
    2.33854883889 * RH +
    -0.14611605 * T * RH +
    -0.012308094 * T * T +
    -0.0164248277778 * RH * RH +
    0.002211732 * T * T * RH +
    0.00072546 * T * RH * RH +
    -0.000003582 * T * T * RH * RH;

  return Math.round(HI * 10) / 10;
}

/**
 * Calcula Ponto de Orvalho (Dew Point)
 * Fórmula de Magnus
 */
export function calculateDewPoint(temperatureC: number, humidity: number): number {
  const T = temperatureC;
  const RH = humidity;

  // Constantes da fórmula de Magnus
  const a = 17.27;
  const b = 237.7;

  // Cálculo do ponto de orvalho
  const alpha = ((a * T) / (b + T)) + Math.log(RH / 100.0);
  const dewPoint = (b * alpha) / (a - alpha);

  return Math.round(dewPoint * 10) / 10;
}

/**
 * Classifica o nível de conforto baseado em Heat Index
 */
export function getHeatIndexLevel(heatIndex: number): {
  level: string;
  color: string;
  description: string;
} {
  if (heatIndex < 27) {
    return { level: 'Confortável', color: 'text-green-600', description: 'Condições confortáveis' };
  } else if (heatIndex < 32) {
    return { level: 'Cuidado', color: 'text-yellow-600', description: 'Cuidado com atividades prolongadas' };
  } else if (heatIndex < 41) {
    return { level: 'Perigoso', color: 'text-orange-600', description: 'Risco de cãibras e exaustão' };
  } else {
    return { level: 'Muito Perigoso', color: 'text-red-600', description: 'Risco de insolação' };
  }
}

/**
 * Classifica o ponto de orvalho
 */
export function getDewPointLevel(dewPoint: number, temperature: number): {
  level: string;
  color: string;
  description: string;
} {
  const diff = temperature - dewPoint;
  
  if (diff < 2) {
    return { level: 'Muito Úmido', color: 'text-red-600', description: 'Risco de condensação' };
  } else if (diff < 5) {
    return { level: 'Úmido', color: 'text-yellow-600', description: 'Sensação de abafamento' };
  } else if (diff < 10) {
    return { level: 'Confortável', color: 'text-green-600', description: 'Condições agradáveis' };
  } else {
    return { level: 'Seco', color: 'text-blue-600', description: 'Ar seco' };
  }
}

