/**
 * Utilitário para determinar condições climáticas baseado em dados meteorológicos
 */

export interface WeatherCondition {
  icon: string;
  label: string;
  description: string;
  severity?: 'normal' | 'warning' | 'danger';
}

/**
 * Determina a condição climática baseada nos dados meteorológicos
 */
export function getWeatherCondition(data: {
  weather_code: number;
  clouds_percent: number;
  precipitation_mm: number;
  temperature_c: number;
  wind_speed_m_s: number;
  uv_index?: number;
  visibility_m?: number;
}): WeatherCondition {
  const { weather_code, clouds_percent, precipitation_mm, temperature_c, wind_speed_m_s, uv_index, visibility_m } = data;

  // Calor Extremo / Onda de Calor
  if (temperature_c >= 35) {
    return {
      icon: '🌡️',
      label: 'Calor Extremo',
      description: `Temperatura de ${temperature_c.toFixed(1)}°C. Onda de calor detectada.`,
      severity: 'danger',
    };
  }

  // Ventos Fortes
  if (wind_speed_m_s >= 15) {
    return {
      icon: '💨',
      label: 'Ventos Fortes',
      description: `Vento de ${wind_speed_m_s.toFixed(1)} m/s. Risco de danos.`,
      severity: 'warning',
    };
  }

  // Índice UV Alto
  if (uv_index !== undefined && uv_index >= 8) {
    return {
      icon: '🔥',
      label: 'Índice UV Alto',
      description: `Índice UV de ${uv_index.toFixed(1)}. Proteção solar necessária.`,
      severity: 'warning',
    };
  }

  // Neblina
  if (visibility_m !== undefined && visibility_m < 1000) {
    return {
      icon: '🌫️',
      label: 'Neblina',
      description: `Visibilidade reduzida: ${(visibility_m / 1000).toFixed(1)} km`,
      severity: 'warning',
    };
  }

  // Tempestade (weather_code 200-299)
  if (weather_code >= 200 && weather_code < 300) {
    return {
      icon: '⛈️',
      label: 'Tempestade',
      description: 'Tempestade com trovões e relâmpagos',
      severity: 'warning',
    };
  }

  // Neve (weather_code 600-699)
  if (weather_code >= 600 && weather_code < 700) {
    return {
      icon: '❄️',
      label: 'Neve',
      description: 'Condições de neve',
      severity: 'normal',
    };
  }

  // Chuva Forte
  if (precipitation_mm >= 10) {
    return {
      icon: '🌧️🌧️',
      label: 'Chuva Forte',
      description: `Chuva intensa: ${precipitation_mm.toFixed(1)} mm`,
      severity: 'warning',
    };
  }

  // Chuva Leve
  if (precipitation_mm > 0 && precipitation_mm < 10) {
    return {
      icon: '🌧️',
      label: 'Chuva Leve',
      description: `Chuva leve: ${precipitation_mm.toFixed(1)} mm`,
      severity: 'normal',
    };
  }

  // Nublado (clouds_percent >= 80)
  if (clouds_percent >= 80) {
    return {
      icon: '☁️',
      label: 'Nublado',
      description: `Cobertura de nuvens: ${clouds_percent}%`,
      severity: 'normal',
    };
  }

  // Parcialmente Nublado (clouds_percent 30-79)
  if (clouds_percent >= 30 && clouds_percent < 80) {
    return {
      icon: '🌤️',
      label: 'Parcialmente Nublado',
      description: `Cobertura de nuvens: ${clouds_percent}%`,
      severity: 'normal',
    };
  }

  // Ensolarado (clouds_percent < 30 e weather_code 800)
  if (clouds_percent < 30 && weather_code === 800) {
    return {
      icon: '☀️',
      label: 'Ensolarado',
      description: 'Céu limpo e ensolarado',
      severity: 'normal',
    };
  }

  // Default: Parcialmente Nublado
  return {
    icon: '🌤️',
    label: 'Parcialmente Nublado',
    description: `Cobertura de nuvens: ${clouds_percent}%`,
    severity: 'normal',
  };
}

/**
 * Obtém a cor de fundo baseada na severidade
 */
export function getSeverityColor(severity?: 'normal' | 'warning' | 'danger'): string {
  switch (severity) {
    case 'danger':
      return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    default:
      return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
  }
}

/**
 * Obtém a cor do texto baseada na severidade
 */
export function getSeverityTextColor(severity?: 'normal' | 'warning' | 'danger'): string {
  switch (severity) {
    case 'danger':
      return 'text-red-700 dark:text-red-300';
    case 'warning':
      return 'text-yellow-700 dark:text-yellow-300';
    default:
      return 'text-blue-700 dark:text-blue-300';
  }
}

