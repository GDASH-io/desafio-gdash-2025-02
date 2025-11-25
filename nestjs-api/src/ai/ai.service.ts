import { Injectable } from '@nestjs/common';

interface WeatherData {
  temperature: number;
  weathercode: number;
  precipitation_probability?: number;
}

export interface WeatherRecommendation {
  mood: string;
  suggestions: string[];
  description: string;
}

@Injectable()
export class AiService {
  getMovieRecommendationsByWeather(weatherData: WeatherData): WeatherRecommendation {
    const { temperature, weathercode, precipitation_probability } = weatherData;

    if (weathercode >= 51 && weathercode <= 67 || (precipitation_probability && precipitation_probability > 30)) { // Chuva leve, moderada ou forte
      return {
        mood: "aconchegante, introspectivo",
        suggestions: ["Drama", "Romance", "Animação"],
        description: "Clima chuvoso ou frio favorece filmes mais introspectivos."
      };
    } else if (temperature >= 25 && weathercode === 0) { // Sol forte
      return {
        mood: "animado, energético",
        suggestions: ["Ação", "Aventura", "Comédia"],
        description: "Clima ensolarado e quente pede filmes animados."
      };
    } else if (weathercode >= 71 && weathercode <= 86) { // Neve, tempestade, etc.
      return {
        mood: "tenso, thriller",
        suggestions: ["Suspense", "Terror", "Mistério"],
        description: "Tempo tempestuoso ou com neve é ideal para filmes de suspense e terror."
      };
    } else { // Nublado ou clima neutro
      return {
        mood: "neutro",
        suggestions: ["Drama", "Sci-Fi", "Policial"],
        description: "Clima nublado ou neutro para filmes mais diversos."
      };
    }
  }
}
