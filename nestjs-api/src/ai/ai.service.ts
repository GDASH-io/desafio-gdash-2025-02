import { Injectable } from '@nestjs/common';

// Minha interface para os dados do clima que vou usar para as recomendações.
interface WeatherData {
  temperature: number;
  weathercode: number;
  precipitation_probability?: number;
}

// Minha interface para o formato da recomendação de filmes que a IA vai gerar.
export interface WeatherRecommendation {
  mood: string;
  suggestions: string[];
  description: string;
}

// Este é o meu serviço de IA, responsável por dar recomendações de filmes com base no clima.
@Injectable()
export class AiService {
  // Esta função pega os dados do clima e me diz quais filmes recomendar, junto com um humor e uma descrição.
  getMovieRecommendationsByWeather(weatherData: WeatherData): WeatherRecommendation {
    const { temperature, weathercode, precipitation_probability } = weatherData;

    // Se estiver chovendo ou com alta probabilidade de chuva, sugiro algo mais aconchegante.
    if (weathercode >= 51 && weathercode <= 67 || (precipitation_probability && precipitation_probability > 30)) { // Chuva leve, moderada ou forte
      return {
        mood: "aconchegante, introspectivo",
        suggestions: ["Drama", "Romance", "Animação"],
        description: "Clima chuvoso ou frio favorece filmes mais introspectivos."
      };
    } else if (temperature >= 25 && weathercode === 0) { // Se estiver sol e quente, peço filmes animados.
      return {
        mood: "animado, energético",
        suggestions: ["Ação", "Aventura", "Comédia"],
        description: "Clima ensolarado e quente pede filmes animados."
      };
    } else if (weathercode >= 71 && weathercode <= 86) { // Se for neve ou tempestade, a pedida é suspense.
      return {
        mood: "tenso, thriller",
        suggestions: ["Suspense", "Terror", "Mistério"],
        description: "Tempo tempestuoso ou com neve é ideal para filmes de suspense e terror."
      };
    } else { // Para o resto (nublado ou neutro), algo mais diverso.
      return {
        mood: "neutro",
        suggestions: ["Drama", "Sci-Fi", "Policial"],
        description: "Clima nublado ou neutro para filmes mais diversos."
      };
    }
  }
}
