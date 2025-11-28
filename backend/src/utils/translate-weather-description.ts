export function translateWeatherDescription(description: string): string {
  const translations: Record<string, string> = {
    'clear sky': 'Céu limpo',
    'mainly clear': 'Predominantemente limpo',
    'partly cloudy': 'Parcialmente nublado',
    overcast: 'Encoberto',
    fog: 'Nevoeiro',
    'depositing rime fog': 'Nevoeiro com gelo',
    'drizzle: light intensity': 'Garoa leve',
    'drizzle: moderate intensity': 'Garoa moderada',
    'drizzle: dense intensity': 'Garoa forte',
    'freezing drizzle: light': 'Garoa congelante leve',
    'freezing drizzle: dense': 'Garoa congelante forte',
    'rain: slight intensity': 'Chuva leve',
    'rain: moderate': 'Chuva moderada',
    'rain: heavy intensity': 'Chuva forte',
    'freezing rain: light': 'Chuva congelante leve',
    'freezing rain: heavy': 'Chuva congelante forte',
    'snowfall: slight': 'Neve leve',
    'snowfall: moderate': 'Neve moderada',
    'snowfall: heavy': 'Neve forte',
    'snow grains': 'Grãos de neve',
    'rain showers: slight': 'Pancadas de chuva leves',
    'rain showers: moderate': 'Pancadas de chuva moderadas',
    'rain showers: violent': 'Pancadas de chuva fortes',
    'snow showers: slight': 'Pancadas de neve leves',
    'snow showers: heavy': 'Pancadas de neve fortes',
    'thunderstorm: slight or moderate': 'Trovoada',
    'thunderstorm with slight hail': 'Trovoada com granizo leve',
    'thunderstorm with heavy hail': 'Trovoada com granizo forte',
  };

  return translations[description.toLowerCase()] || description;
}
