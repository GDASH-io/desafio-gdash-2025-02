export function translateWeatherDescription(description: string): string {
  const translations: Record<string, string> = {
    'Clear sky': 'Céu limpo',
    'Mainly clear': 'Predominantemente limpo',
    'Partly cloudy': 'Parcialmente nublado',
    Overcast: 'Encoberto',
    Fog: 'Nevoeiro',
    'Depositing rime fog': 'Nevoeiro com gelo',
    'Drizzle: Light intensity': 'Garoa leve',
    'Drizzle: Moderate intensity': 'Garoa moderada',
    'Drizzle: Dense intensity': 'Garoa forte',
    'Freezing drizzle: Light': 'Garoa congelante leve',
    'Freezing drizzle: Dense': 'Garoa congelante forte',
    'Rain: Slight intensity': 'Chuva leve',
    'Rain: Moderate': 'Chuva moderada',
    'Rain: Heavy intensity': 'Chuva forte',
    'Freezing rain: Light': 'Chuva congelante leve',
    'Freezing rain: Heavy': 'Chuva congelante forte',
    'Snowfall: Slight': 'Neve leve',
    'Snowfall: Moderate': 'Neve moderada',
    'Snowfall: Heavy': 'Neve forte',
    'Snow grains': 'Grãos de neve',
    'Rain showers: Slight': 'Pancadas de chuva leves',
    'Rain showers: Moderate': 'Pancadas de chuva moderadas',
    'Rain showers: Violent': 'Pancadas de chuva fortes',
    'Snow showers: Slight': 'Pancadas de neve leves',
    'Snow showers: Heavy': 'Pancadas de neve fortes',
    'Thunderstorm: Slight or moderate': 'Trovoada',
    'Thunderstorm with slight hail': 'Trovoada com granizo leve',
    'Thunderstorm with heavy hail': 'Trovoada com granizo forte',
  };

  return translations[description.toLowerCase()] || description;
}
