import { Injectable } from '@nestjs/common';

export interface FullWeatherData {
  temperature: number;
  apparent_temperature: number;
  rain: number;
  wind_speed: number;
  humidity: number;
  weathercode: number;
  precipitation_probability?: number;
  hourly_units?: { [key: string]: string };
  hourly?: { [key: string]: number[] };
}

export interface WeatherRecommendation {
  mood: string;
  suggestions: string[];
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
  getMovieRecommendationsByWeather(weatherData: FullWeatherData): WeatherRecommendation {
    const { temperature, weathercode, precipitation_probability } = weatherData;

    if (weathercode >= 51 && weathercode <= 67 || (precipitation_probability && precipitation_probability > 30)) { // Chuva leve, moderada ou forte
      return {
        mood: "aconchegante, introspectivo",
        suggestions: ["Drama", "Romance", "Animação"],
        description: "Clima chuvoso ou frio favorece filmes mais introspectivos."
      };
    } else if (temperature >= 25 && weathercode === 0) { 
      return {
        mood: "animado, energético",
        suggestions: ["Ação", "Aventura", "Comédia"],
        description: "Clima ensolarado e quente pede filmes animados."
      };
    } else if (weathercode >= 71 && weathercode <= 86) { 
      return {
        mood: "tenso, thriller",
        suggestions: ["Suspense", "Terror", "Mistério"],
        description: "Tempo tempestuoso ou com neve é ideal para filmes de suspense e terror."
      };
    } else { 
      return {
        mood: "neutro",
        suggestions: ["Drama", "Sci-Fi", "Policial"],
        description: "Clima nublado ou neutro para filmes mais diversos."
      };
    }
  }

  explainWeather(weatherData: WeatherDataForExplanation): string {
    const { temperature, rain, wind, humidity } = weatherData;
    let explanation = `Hoje em Salvador o clima será`;

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

  generateSmartAlerts(weatherData: FullWeatherData): string[] {
    const smartAlerts: string[] = [];
    const { rain, hourly } = weatherData;

    if (rain > 0 && hourly && hourly.precipitation && hourly.precipitation.slice(0, 3).some(p => p > 0)) {
      smartAlerts.push("Risco de chuva súbita nas próximas 3 horas.");
    }


    return smartAlerts;
  }

  getActivityRecommendations(weatherData: FullWeatherData): string[] {
    const recommendations: string[] = [];
    const { temperature, rain, weathercode } = weatherData;

    if (rain > 0 || (weathercode >= 51 && weathercode <= 67)) { 
      recommendations.push("Atividades internas: ler um livro, maratona de séries, jogos de tabuleiro.");
    } else if (temperature >= 25 && weathercode === 0) { 
      recommendations.push("Atividades ao ar livre: praia, piscina, caminhada no parque, piquenique.");
    } else if (temperature >= 15 && temperature < 25 && weathercode === 0) { 
      recommendations.push("Atividades moderadas ao ar livre: ciclismo, corrida leve, jardinagem.");
    } else { 
      recommendations.push("Atividades flexíveis: museus, cafés, compras, cinema.");
    }

    return recommendations;
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

  getDaySummary(weatherData: FullWeatherData): string {
    const { temperature, rain, weathercode, apparent_temperature } = weatherData;
    let summary = this.explainWeather({
      temperature: temperature,
      rain: rain, 
      wind: weatherData.wind_speed, 
      humidity: weatherData.humidity,
    });
    summary += "\n\n";

    const alerts = this.generateHealthAlerts(weatherData).concat(this.generateSmartAlerts(weatherData));
    if (alerts.length > 0) {
      summary += "Alertas de saúde e inteligentes:\n" + alerts.map(alert => `- ${alert}`).join("\n") + "\n\n";
    }

    const activities = this.getActivityRecommendations(weatherData);
    summary += "Sugestões de atividades:\n" + activities.map(activity => `- ${activity}`).join("\n") + "\n\n";

    summary += `Sugestão de roupa: ${this.getClothingSuggestions(weatherData)}`;

    return summary;
  }

  getMoodInsights(weatherData: FullWeatherData): string {
    const { temperature, weathercode } = weatherData;

    if (weathercode === 0 && temperature >= 25) {
      return "O dia ensolarado e quente pode trazer mais energia e bom humor! Aproveite para recarregar as energias.";
    } else if (weathercode >= 51 && weathercode <= 67) {
      return "O clima chuvoso pode convidar à introspecção e ao relaxamento. Que tal um filme ou um livro?";
    } else if (temperature < 15) {
      return "Temperaturas mais baixas podem pedir mais conforto e aconchego. Cuide-se e mantenha-se aquecido.";
    } else {
      return "Clima neutro, seu humor provavelmente não será muito afetado pelo tempo hoje.";
    }
  }
}
