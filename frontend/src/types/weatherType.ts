// Representa uma linha da tabela de logs (vinda do Mongo)
export type WeatherDataLog = {
  _id: string;
  location_lat: number;
  location_lon: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition_code: number;
  collected_at: string; // Data em formato ISO string
  createdAt: string;
};

// Representa o objeto de inteligência (vindo do Gemini ou Lógica local)
export type AiInsight = {
  source: string; // Ex: "Google Gemini" ou "Algoritmo Local"
  analysis_date: string;

  // Campos de texto que a IA retorna
  summary?: string;
  ai_summary?: string; // Fallback caso o nome do campo varie

  alert?: string;
  alert_message?: string; // Fallback

  recommendation?: string;
  raw_data_samples?: number;
  temperature_next_hour?: number;
  predicted_weather_next_hour?: string;
};
