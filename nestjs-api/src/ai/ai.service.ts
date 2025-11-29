import { Injectable } from '@nestjs/common';
import { GroqService } from './groq.service';

export interface FullWeatherData {
  temperature: number;
  apparent_temperature: number;
  rain: number;
  wind_speed: number;
  humidity: number;
  weathercode: number;
  precipitation_probability?: number;
  uv_index?: number;
  hourly_units?: { [key: string]: string };
  hourly?: { [key: string]: number[] };
}

export interface WeatherRecommendation {
  mood: string;
  suggestions: string[];
  description: string;
}

export interface MovieCriteria {
  tema: string;
  generos_sugeridos: string[];
  tons: string[];
  popularidade_minima?: number;
  vote_average_min?: number;
  year_range?: {
    min?: number;
    max?: number;
  };
  description: string;
}

interface WeatherDataForExplanation {
  temperature: number;
  rain: number;
  wind: number;
  humidity: number;
}

@Injectable()
export class AiService {
  constructor(
    private groqService: GroqService,
  ) {}

  async getMovieRecommendationsByWeather(weatherData: FullWeatherData, cityName?: string): Promise<MovieCriteria> {
    try {
      return await this.groqService.generateMovieCriteria(weatherData, cityName);
    } catch (error: any) {
      console.error('❌ [AI] Groq falhou. Usando fallback estático.');
      return this.groqService.getFallbackMovieCriteria(weatherData);
    }
  }

  getMovieRecommendationsByWeatherLegacy(weatherData: FullWeatherData): WeatherRecommendation {
    const { temperature, weathercode, precipitation_probability, humidity, wind_speed } = weatherData;
    
    const baseVariation = Math.floor((temperature * 7 + weathercode * 11 + (precipitation_probability || 0) * 3 + humidity * 5 + wind_speed * 2) % 5);
    const timeVariation = Math.floor((new Date().getHours() / 5) % 5);
    const variation = (baseVariation + timeVariation) % 5;

    if (weathercode >= 51 && weathercode <= 67 || (precipitation_probability && precipitation_probability > 30)) {
      const rainyMoods = [
        { mood: "aconchegante, introspectivo", suggestions: ["Drama", "Romance", "Animação", "Musical", "Família"], description: "Clima chuvoso cria uma atmosfera perfeita para filmes emocionais e envolventes." },
        { mood: "melancólico, contemplativo", suggestions: ["Drama", "Indie", "Romance", "Arte", "Biografia"], description: "A chuva convida à introspecção e filmes que tocam o coração." },
        { mood: "nostálgico, romântico", suggestions: ["Romance", "Drama", "Comédia Romântica", "Clássico", "Musical"], description: "Dias chuvosos são ideais para histórias de amor e nostalgia." },
        { mood: "relaxante, calmante", suggestions: ["Animação", "Família", "Comédia", "Documentário", "Natureza"], description: "O som da chuva combina perfeitamente com filmes leves e relaxantes." },
        { mood: "profundo, filosófico", suggestions: ["Drama", "Sci-Fi", "Thriller Psicológico", "Arte", "Documentário"], description: "Clima chuvoso favorece filmes que fazem você refletir sobre a vida." },
      ];
      return rainyMoods[variation];
    } else if (temperature >= 25 && weathercode === 0) {
      const sunnyMoods = [
        { mood: "animado, energético", suggestions: ["Ação", "Aventura", "Comédia", "Esportes", "Musical"], description: "Clima ensolarado e quente pede filmes cheios de energia e ação." },
        { mood: "aventureiro, explorador", suggestions: ["Aventura", "Ação", "Fantasia", "Sci-Fi", "Thriller"], description: "Dias quentes e ensolarados são perfeitos para grandes aventuras cinematográficas." },
        { mood: "festivo, descontraído", suggestions: ["Comédia", "Musical", "Família", "Aventura", "Romance"], description: "O calor convida a filmes leves, divertidos e cheios de diversão." },
        { mood: "épico, grandioso", suggestions: ["Ação", "Aventura", "Fantasia", "Épico", "Guerra"], description: "Clima quente combina com filmes de grande escala e emoção." },
        { mood: "esportivo, competitivo", suggestions: ["Esportes", "Ação", "Drama", "Biografia", "Documentário"], description: "Dias ensolarados são ideais para filmes sobre superação e competição." },
      ];
      return sunnyMoods[variation];
    } else if (weathercode >= 71 && weathercode <= 86) {
      const stormyMoods = [
        { mood: "tenso, thriller", suggestions: ["Suspense", "Terror", "Mistério", "Thriller", "Crime"], description: "Tempo tempestuoso ou com neve cria a atmosfera perfeita para suspense." },
        { mood: "sombrio, gótico", suggestions: ["Terror", "Thriller Psicológico", "Mistério", "Horror", "Gótico"], description: "Condições extremas do tempo combinam com filmes sombrios e intensos." },
        { mood: "claustrofóbico, isolado", suggestions: ["Thriller", "Suspense", "Terror", "Drama", "Psicológico"], description: "Tempestades e neve criam sensação de isolamento perfeita para thrillers." },
        { mood: "sobrevivência, resistência", suggestions: ["Ação", "Aventura", "Drama", "Suspense", "Thriller"], description: "Clima extremo combina com histórias de sobrevivência e coragem." },
        { mood: "misterioso, enigmático", suggestions: ["Mistério", "Thriller", "Suspense", "Noir", "Crime"], description: "Tempo tempestuoso é ideal para filmes que mantêm você na ponta da cadeira." },
      ];
      return stormyMoods[variation];
    } else if (temperature < 10) {
      const coldMoods = [
        { mood: "aconchegante, dramático", suggestions: ["Drama", "Romance", "Biografia", "Histórico", "Literatura"], description: "Temperaturas baixas pedem filmes envolventes e emocionais para assistir aconchegado." },
        { mood: "íntimo, pessoal", suggestions: ["Drama", "Romance", "Indie", "Arte", "Comédia Dramática"], description: "O frio convida a filmes que exploram relacionamentos e emoções profundas." },
        { mood: "clássico, atemporal", suggestions: ["Clássico", "Drama", "Romance", "Literatura", "Biografia"], description: "Clima frio é perfeito para filmes clássicos e histórias atemporais." },
        { mood: "reflexivo, profundo", suggestions: ["Drama", "Arte", "Filosófico", "Documentário", "Indie"], description: "Temperaturas baixas favorecem filmes que fazem você pensar e sentir." },
        { mood: "romântico, caloroso", suggestions: ["Romance", "Comédia Romântica", "Drama", "Família", "Musical"], description: "O frio de fora contrasta com o calor das histórias de amor e família." },
      ];
      return coldMoods[variation];
    } else if (weathercode >= 1 && weathercode <= 3) {
      const cloudyMoods = [
        { mood: "contemplativo, artístico", suggestions: ["Drama", "Arte", "Documentário", "Indie", "Biografia"], description: "Clima nublado é perfeito para filmes mais contemplativos e artísticos." },
        { mood: "equilibrado, diverso", suggestions: ["Drama", "Comédia", "Thriller", "Romance", "Aventura"], description: "Céu nublado permite explorar diferentes gêneros cinematográficos." },
        { mood: "neutro, versátil", suggestions: ["Drama", "Comédia Dramática", "Thriller", "Sci-Fi", "Mistério"], description: "Clima neutro oferece liberdade para escolher entre diversos estilos." },
        { mood: "sutil, elegante", suggestions: ["Drama", "Arte", "Indie", "Literatura", "Clássico"], description: "Dias nublados combinam com filmes de produção refinada e narrativa elegante." },
        { mood: "flexível, adaptável", suggestions: ["Comédia", "Drama", "Aventura", "Romance", "Musical"], description: "Clima variável permite uma seleção ampla e variada de filmes." },
      ];
      return cloudyMoods[variation];
    } else {
      const variedMoods = [
        { mood: "equilibrado, variado", suggestions: ["Comédia", "Drama", "Aventura", "Romance", "Thriller"], description: "Clima variável permite uma boa variedade de opções cinematográficas." },
        { mood: "ecletismo, diversidade", suggestions: ["Drama", "Comédia", "Thriller", "Sci-Fi", "Mistério"], description: "Condições climáticas variadas abrem espaço para diferentes gêneros." },
        { mood: "exploratório, curioso", suggestions: ["Documentário", "Drama", "Arte", "Indie", "Biografia"], description: "Clima instável convida a explorar filmes fora do comum." },
        { mood: "adaptável, flexível", suggestions: ["Comédia", "Aventura", "Drama", "Romance", "Musical"], description: "Clima em transição permite escolher filmes conforme seu humor do momento." },
        { mood: "surpresa, descoberta", suggestions: ["Thriller", "Mistério", "Drama", "Comédia", "Ação"], description: "Clima variável é ideal para descobrir filmes novos e surpreendentes." },
      ];
      return variedMoods[variation];
    }
  }

  explainWeather(weatherData: WeatherDataForExplanation, cityName?: string): string {
    const { temperature, rain, wind, humidity } = weatherData;
    const city = cityName || 'a localização';
    let explanation = `Hoje em ${city} o clima será`;

    if (rain > 50) {
      explanation += ` chuvoso, com possibilidade de pancadas fortes.`;
    } else if (rain > 10) {
      explanation += ` parcialmente nublado com chance de chuva leve.`;
    } else {
      explanation += ` predominantemente ensolarado.`;
    }

    explanation += ` A temperatura será agradável de ${temperature} °C.`;

    if (wind > 20) {
      explanation += ` O vento estará moderado a forte, tome cuidado.`;
    } else {
      explanation += ` O vento estará leve.`;
    }

    if (humidity > 70) {
      explanation += ` A umidade alta pode causar sensação de abafamento.`;
    } else {
      explanation += ` A umidade estará em níveis confortáveis.`;
    }

    return explanation;
  }

  generateHealthAlerts(weatherData: FullWeatherData): string[] {
    const alerts: string[] = [];
    const { temperature, apparent_temperature, humidity, wind_speed, weathercode } = weatherData;

    if (temperature >= 30 && apparent_temperature >= 35) {
      alerts.push("Calor intenso previsto — mantenha-se hidratado e evite exposição prolongada ao sol.");
    }

    if (apparent_temperature - temperature >= 5) {
      alerts.push(`Sensação térmica de ${apparent_temperature}°C muito acima da temperatura real de ${temperature}°C. Vista-se adequadamente.`);
    }

    if (temperature <= 10) {
      alerts.push("Temperatura baixa prevista — agasalhe-se bem e evite friagens.");
    }

    if (humidity >= 90) {
      alerts.push("Umidade do ar muito alta — pode causar sensação de abafamento e desconforto.");
    }

    if (wind_speed >= 40) {
      alerts.push("Ventos fortes esperados — tome cuidado com objetos soltos e atividades ao ar livre.");
    }

    if (weathercode >= 61 && weathercode <= 67) { 
      alerts.push("Risco de chuva moderada a forte nas próximas horas. Leve um guarda-chuva.");
    }

    if (weathercode >= 95 && weathercode <= 99) { 
      alerts.push("Alerta de tempestade! Procure abrigo e evite sair de casa.");
    }

    return alerts;
  }

  async generateSmartAlerts(weatherData: FullWeatherData, cityName: string): Promise<string[]> {
    try {
      return await this.groqService.generateSmartAlerts(weatherData, cityName);
    } catch (error: any) {
      console.error('❌ [AI] Groq falhou. Usando fallback estático.');
      return this.groqService.getFallbackSmartAlerts(weatherData);
    }
  }

  async getActivityRecommendations(weatherData: FullWeatherData, cityName: string): Promise<string[]> {
    try {
      return await this.groqService.generateActivityRecommendations(weatherData, cityName);
    } catch (error: any) {
      console.error('❌ [AI] Groq falhou. Usando fallback estático.');
      return this.groqService.getFallbackActivityRecommendations(weatherData);
    }
  }

  getClothingSuggestions(weatherData: FullWeatherData): string {
    const { temperature, rain, wind_speed } = weatherData;

    if (rain > 0) {
      return "Leve um guarda-chuva ou capa de chuva. Use roupas impermeáveis.";
    }

    if (temperature >= 28) {
      return "Roupas leves e frescas, como camisetas e shorts. Não se esqueça do protetor solar!";
    }

    if (temperature >= 20 && temperature < 28) {
      return "Roupas leves, mas com uma opção para cobrir os braços, como um cardigã leve.";
    }

    if (temperature >= 15 && temperature < 20) {
      return "Camadas leves, como uma camiseta com uma jaqueta fina ou moletom.";
    }

    if (temperature < 15) {
      return "Roupas quentes: casaco, blusa de manga comprida, calças e talvez um cachecol.";
    }

    if (wind_speed > 30) {
      return "Considere usar um casaco corta-vento.";
    }

    return "Roupas confortáveis para o dia.";
  }

  async getDaySummary(weatherData: FullWeatherData, cityName: string): Promise<string> {
    try {
      return await this.groqService.generateDaySummary(weatherData, cityName);
    } catch (error: any) {
      console.error('❌ [AI] Groq falhou. Usando fallback estático.');
      return this.groqService.getFallbackDaySummary(weatherData, cityName);
    }
  }

  async getMoodInsights(weatherData: FullWeatherData, cityName: string): Promise<string> {
    try {
      return await this.groqService.generateMoodInsights(weatherData, cityName);
    } catch (error: any) {
      console.error('❌ [AI] Groq falhou. Usando fallback estático.');
      return this.groqService.getFallbackMoodInsights(weatherData);
    }
  }

  getApparentTemperatureExplanation(weatherData: FullWeatherData): string {
    const { temperature, apparent_temperature, humidity, wind_speed } = weatherData;
    const difference = apparent_temperature - temperature;

    if (Math.abs(difference) < 1) {
      return `A sensação térmica de ${apparent_temperature}°C está próxima da temperatura real de ${temperature}°C.`;
    }

    if (difference > 3) {
      if (humidity > 70) {
        return `A sensação térmica de ${apparent_temperature}°C está ${difference.toFixed(1)}°C acima da temperatura real de ${temperature}°C devido à umidade alta (${humidity}%), que causa sensação de abafamento.`;
      } else if (wind_speed < 5) {
        return `A sensação térmica de ${apparent_temperature}°C está ${difference.toFixed(1)}°C acima da temperatura real de ${temperature}°C. O vento leve não está ajudando a refrescar.`;
      }
    } else if (difference < -3) {
      if (wind_speed > 20) {
        return `A sensação térmica de ${apparent_temperature}°C está ${Math.abs(difference).toFixed(1)}°C abaixo da temperatura real de ${temperature}°C devido ao vento forte (${wind_speed} km/h), que aumenta a sensação de frio.`;
      }
    }

    return `A sensação térmica de ${apparent_temperature}°C está ${difference > 0 ? `${difference.toFixed(1)}°C acima` : `${Math.abs(difference).toFixed(1)}°C abaixo`} da temperatura real de ${temperature}°C.`;
  }

  getUvIndexAlert(uvIndex: number): { level: string; color: string; message: string } {
    if (uvIndex >= 0 && uvIndex < 3) {
      return {
        level: 'Baixo',
        color: 'green',
        message: 'UV baixo — seguro para exposição prolongada ao sol.'
      };
    } else if (uvIndex >= 3 && uvIndex < 6) {
      return {
        level: 'Moderado',
        color: 'yellow',
        message: 'UV moderado — use protetor solar e evite exposição prolongada ao meio-dia.'
      };
    } else if (uvIndex >= 6 && uvIndex < 8) {
      return {
        level: 'Alto',
        color: 'orange',
        message: 'UV alto — evite exposição prolongada ao sol, use protetor solar e roupas adequadas.'
      };
    } else if (uvIndex >= 8 && uvIndex < 11) {
      return {
        level: 'Muito Alto',
        color: 'red',
        message: 'UV muito alto — evite exposição prolongada ao sol, procure sombra e use proteção adequada.'
      };
    } else {
      return {
        level: 'Extremo',
        color: 'red',
        message: 'UV extremo — evite sair ao sol, procure abrigo e use proteção máxima.'
      };
    }
  }

  getDetailedClothingSuggestions(weatherData: FullWeatherData): string[] {
    const suggestions: string[] = [];
    const { temperature, rain, wind_speed, humidity, uv_index } = weatherData;

    if (temperature >= 28) {
      suggestions.push('👕 Camiseta leve');
      suggestions.push('👖 Bermuda ou shorts');
      if (uv_index && uv_index >= 6) {
        suggestions.push('🧢 Boné ou chapéu');
        suggestions.push('🕶 Óculos de sol');
      }
    } else if (temperature >= 20 && temperature < 28) {
      suggestions.push('👕 Camiseta ou regata');
      suggestions.push('👖 Calça leve ou bermuda');
      if (uv_index && uv_index >= 6) {
        suggestions.push('🧢 Boné');
        suggestions.push('🕶 Óculos de sol');
      }
    } else if (temperature >= 15 && temperature < 20) {
      suggestions.push('👕 Camiseta de manga comprida');
      suggestions.push('👖 Calça');
      suggestions.push('🧥 Cardigã ou jaqueta leve');
    } else {
      suggestions.push('🧥 Casaco ou jaqueta');
      suggestions.push('👕 Blusa de manga comprida');
      suggestions.push('👖 Calça');
      suggestions.push('🧣 Cachecol (opcional)');
    }

    if (rain > 30 || (weatherData.precipitation_probability && weatherData.precipitation_probability > 50)) {
      suggestions.push('🌂 Guarda-chuva (chance alta de chuva)');
    } else if (rain > 0 || (weatherData.precipitation_probability && weatherData.precipitation_probability > 20)) {
      suggestions.push('🌂 Levar sombrinha (chance baixa de chuva, mas pode ter pancadas)');
    }

    if (wind_speed > 30) {
      suggestions.push('🧥 Casaco corta-vento');
    }

    if (uv_index && uv_index >= 6) {
      suggestions.push('🧴 Protetor solar (essencial)');
    }

    return suggestions;
  }

  async getHealthAndWellnessConditions(weatherData: FullWeatherData, cityName: string): Promise<string[]> {
    try {
      return await this.groqService.generateHealthAndWellnessConditions(weatherData, cityName);
    } catch (error: any) {
      console.error('❌ [AI] Groq falhou. Usando fallback estático.');
      return this.groqService.getFallbackHealthConditions(weatherData);
    }
  }
}
