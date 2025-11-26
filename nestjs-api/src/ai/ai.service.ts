import { Injectable } from '@nestjs/common';

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

    // Baseado na temperatura
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

    // Baseado na chuva
    if (rain > 30 || (weatherData.precipitation_probability && weatherData.precipitation_probability > 50)) {
      suggestions.push('🌂 Guarda-chuva (chance alta de chuva)');
    } else if (rain > 0 || (weatherData.precipitation_probability && weatherData.precipitation_probability > 20)) {
      suggestions.push('🌂 Levar sombrinha (chance baixa de chuva, mas pode ter pancadas)');
    }

    // Baseado no vento
    if (wind_speed > 30) {
      suggestions.push('🧥 Casaco corta-vento');
    }

    // Baseado no UV
    if (uv_index && uv_index >= 6) {
      suggestions.push('🧴 Protetor solar (essencial)');
    }

    return suggestions;
  }

  getHealthAndWellnessConditions(weatherData: FullWeatherData): string[] {
    const conditions: string[] = [];
    const { temperature, apparent_temperature, humidity, wind_speed, uv_index } = weatherData;

    // Calor
    if (temperature >= 30 || apparent_temperature >= 35) {
      conditions.push(`🌡️ Muito calor previsto — mantenha-se hidratado, beba água regularmente e evite atividades físicas intensas ao ar livre.`);
    }

    // Umidade
    if (humidity > 80) {
      conditions.push(`💧 Umidade muito alta (${humidity}%) — pode causar sensação de abafamento e desconforto respiratório. Mantenha-se hidratado.`);
    } else if (humidity < 30) {
      conditions.push(`🌵 Ar muito seco (${humidity}%) — pode causar irritação nos olhos, pele seca e desconforto. Use hidratante e colírios se necessário.`);
    }

    // Vento
    if (wind_speed > 40) {
      conditions.push(`💨 Vento forte (${wind_speed} km/h) — pode agravar alergias e causar irritação nas vias respiratórias. Pessoas sensíveis devem evitar exposição prolongada.`);
    }

    // UV
    if (uv_index && uv_index >= 8) {
      conditions.push(`☀️ Índice UV extremo (${uv_index}) — risco alto de queimaduras solares. Evite exposição ao sol entre 10h e 16h.`);
    } else if (uv_index && uv_index >= 6) {
      conditions.push(`☀️ Índice UV alto (${uv_index}) — use protetor solar e evite exposição prolongada ao sol.`);
    }

    // Sensação térmica
    if (apparent_temperature - temperature >= 5) {
      conditions.push(`🌡️ Sensação térmica muito acima da temperatura real — a umidade alta está aumentando a sensação de calor. Vista-se com roupas leves e respiráveis.`);
    }

    return conditions;
  }
}
