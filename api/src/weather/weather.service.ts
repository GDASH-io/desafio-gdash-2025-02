import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { LoggerService } from '../common/logger.service';
import { WeatherDataNotFoundError, DataExportError, InsightGenerationError } from '../common/exception-filter';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) 
    private weatherLogModel: Model<WeatherLogDocument>,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext('WeatherService');
  }

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Creating new weather log entry', 'WeatherService', {
        city: createWeatherLogDto.city,
        country: createWeatherLogDto.country,
        temperature: createWeatherLogDto.temperature,
      });

      const createdLog = new this.weatherLogModel(createWeatherLogDto);
      const result = await createdLog.save();
      
      const duration = Date.now() - startTime;
      this.logger.logWeatherDataCollection(
        createWeatherLogDto.city,
        createWeatherLogDto.country,
        true,
        { duration, id: result._id },
      );
      
      this.logger.logPerformanceMetric('weather-data-creation', duration, {
        city: createWeatherLogDto.city,
        recordId: result._id,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.logWeatherDataCollection(
        createWeatherLogDto.city,
        createWeatherLogDto.country,
        false,
        { duration, error: error.message },
      );
      
      this.logger.error(
        'Failed to create weather log entry',
        error.stack,
        'WeatherService',
        { city: createWeatherLogDto.city, country: createWeatherLogDto.country },
      );
      
      throw error;
    }
  }

  async findAll(limit?: number, skip?: number): Promise<WeatherLog[]> {
    const startTime = Date.now();
    
    try {
      this.logger.debug('Fetching weather log entries', 'WeatherService', { limit, skip });
      
      const query = this.weatherLogModel.find().sort({ timestamp: -1 });
      
      if (skip) {
        query.skip(skip);
      }
      
      if (limit) {
        query.limit(limit);
      }
      
      const result = await query.exec();
      
      const duration = Date.now() - startTime;
      this.logger.logPerformanceMetric('weather-data-fetch-all', duration, {
        recordCount: result.length,
        limit,
        skip,
      });
      
      this.logger.info(`Retrieved ${result.length} weather log entries`, 'WeatherService', {
        recordCount: result.length,
        duration,
        limit,
        skip,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'Failed to fetch weather log entries',
        error.stack,
        'WeatherService',
        { duration, limit, skip },
      );
      
      throw error;
    }
  }

  async findRecent(hours: number = 24): Promise<WeatherLog[]> {
    const since = new Date();
    since.setHours(since.getHours() - hours);
    
    return this.weatherLogModel
      .find({ timestamp: { $gte: since } })
      .sort({ timestamp: -1 })
      .exec();
  }

  async getStatistics(): Promise<any> {
    const last24Hours = await this.findRecent(24);
    const last7Days = await this.findRecent(24 * 7);
    
    if (last24Hours.length === 0) {
      return {
        last24Hours: { count: 0 },
        last7Days: { count: 0 },
      };
    }

    const calculateStats = (data: WeatherLog[]) => {
      const temps = data.map(d => d.temperature);
      const humidity = data.map(d => d.humidity);
      const windSpeeds = data.map(d => d.windSpeed);
      
      return {
        count: data.length,
        temperature: {
          avg: temps.reduce((a, b) => a + b, 0) / temps.length,
          min: Math.min(...temps),
          max: Math.max(...temps),
        },
        humidity: {
          avg: humidity.reduce((a, b) => a + b, 0) / humidity.length,
          min: Math.min(...humidity),
          max: Math.max(...humidity),
        },
        windSpeed: {
          avg: windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length,
          min: Math.min(...windSpeeds),
          max: Math.max(...windSpeeds),
        },
      };
    };

    return {
      last24Hours: calculateStats(last24Hours),
      last7Days: calculateStats(last7Days),
    };
  }

  async generateInsights(): Promise<any> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting AI insights generation');
      
      const stats = await this.getStatistics();
      const recent = await this.findRecent(24);
      
      if (recent.length === 0) {
        this.logger.warn('No weather data available for insights generation');
        return {
          summary: 'Não há dados climáticos disponíveis',
          recommendations: [],
          alerts: [],
          predictions: [],
          detailedAnalysis: [],
          activityRecommendations: [],
          comfortScore: 0,
          lastUpdated: new Date().toISOString(),
          dataQuality: { quality: 'poor', message: 'Dados insuficientes' }
        };
      }

    const latest = recent[0];
    const alerts = [];
    const recommendations = [];
    const predictions = [];
    const detailedAnalysis = [];
    
    // Enhanced temperature analysis with predictive insights
    if (latest.temperature > 40) {
      alerts.push({ type: 'danger', message: 'Temperatura perigosamente alta - Risco de insolação' });
      recommendations.push('🚨 URGENTE: Procure abrigo com ar condicionado, hidrate-se constantemente');
      predictions.push('Condições podem se manter críticas nas próximas 2-3 horas');
    } else if (latest.temperature > 35) {
      alerts.push({ type: 'warning', message: 'Temperatura extremamente alta' });
      recommendations.push('🌡️ Mantenha-se hidratado, evite sol direto, use protetor solar');
      predictions.push('Temperature pode continuar elevada. Monitore sinais de desidratação');
    } else if (latest.temperature > 30) {
      alerts.push({ type: 'caution', message: 'Temperatura elevada' });
      recommendations.push('☀️ Use roupas leves, beba água regularmente, evite exercícios intensos');
    } else if (latest.temperature < 0) {
      alerts.push({ type: 'danger', message: 'Temperatura abaixo de zero - Risco de hipotermia' });
      recommendations.push('🥶 URGENTE: Aqueça-se imediatamente, vista várias camadas');
      predictions.push('Risco de formação de gelo. Cuidado ao caminhar');
    } else if (latest.temperature < 5) {
      alerts.push({ type: 'warning', message: 'Temperatura muito baixa' });
      recommendations.push('🧥 Vista roupas adequadas, proteja extremidades do corpo');
      predictions.push('Temperatura pode continuar baixa. Prepare-se para frio prolongado');
    }
    
    // Enhanced humidity analysis with health impacts
    if (latest.humidity > 85) {
      alerts.push({ type: 'warning', message: 'Umidade excessiva - Desconforto respiratório' });
      recommendations.push('💨 Melhore ventilação, use desumidificador, evite atividades intensas');
      detailedAnalysis.push('Alta umidade dificulta regulação térmica corporal');
    } else if (latest.humidity > 80) {
      alerts.push({ type: 'info', message: 'Alta umidade' });
      recommendations.push('🌫️ Ambiente pode estar abafado, considere ventilação');
    } else if (latest.humidity < 25) {
      alerts.push({ type: 'warning', message: 'Umidade extremamente baixa - Ressecamento' });
      recommendations.push('💧 Use umidificador, hidrate pele, beba mais água, evite exposição prolongada');
      detailedAnalysis.push('Baixa umidade pode irritar vias respiratórias e pele');
    } else if (latest.humidity < 30) {
      alerts.push({ type: 'info', message: 'Baixa umidade' });
      recommendations.push('💦 Considere usar umidificador ou beber mais água');
    }
    
    // Enhanced wind analysis with activity recommendations
    if (latest.windSpeed > 40) {
      alerts.push({ type: 'danger', message: 'Ventos muito fortes - Condições perigosas' });
      recommendations.push('🌪️ EVITE sair, cuidado com queda de árvores, feche janelas');
      predictions.push('Ventos fortes podem causar danos estruturais');
    } else if (latest.windSpeed > 25) {
      alerts.push({ type: 'warning', message: 'Ventos fortes' });
      recommendations.push('💨 Cuidado com objetos soltos, evite atividades ao ar livre');
      predictions.push('Ventos podem intensificar sensação térmica');
    } else if (latest.windSpeed < 2) {
      detailedAnalysis.push('Ar parado pode aumentar sensação de calor e umidade');
    }
    
    // Pressure analysis for health sensitive individuals
    if (latest.pressure < 1000) {
      alerts.push({ type: 'info', message: 'Pressão baixa - Possível desconforto' });
      recommendations.push('🏔️ Pessoas sensíveis podem sentir dores de cabeça ou fadiga');
    } else if (latest.pressure > 1025) {
      alerts.push({ type: 'info', message: 'Pressão alta - Tempo estável' });
      detailedAnalysis.push('Alta pressão geralmente indica tempo seco e estável');
    }
    
    // Enhanced comfort score calculation (0-100) with multiple factors
    let comfortScore = 100;
    let comfortFactors = [];
    
    // Temperature comfort (18-26°C is optimal, with seasonal adjustments)
    const tempOptimal = 22; // Ideal temperature
    if (latest.temperature < 16 || latest.temperature > 28) {
      const tempPenalty = Math.abs(latest.temperature - tempOptimal) * 3;
      comfortScore -= tempPenalty;
      comfortFactors.push(`Temperatura ${latest.temperature < 16 ? 'muito baixa' : 'muito alta'} (-${Math.round(tempPenalty)} pontos)`);
    } else if (latest.temperature < 18 || latest.temperature > 26) {
      const tempPenalty = Math.abs(latest.temperature - tempOptimal) * 2;
      comfortScore -= tempPenalty;
      comfortFactors.push(`Temperatura ${latest.temperature < 18 ? 'baixa' : 'alta'} (-${Math.round(tempPenalty)} pontos)`);
    }
    
    // Humidity comfort (40-65% is optimal)
    if (latest.humidity < 30 || latest.humidity > 75) {
      const humidityPenalty = latest.humidity < 30 ? (30 - latest.humidity) * 1.5 : (latest.humidity - 75) * 1.2;
      comfortScore -= humidityPenalty;
      comfortFactors.push(`Umidade ${latest.humidity < 30 ? 'muito baixa' : 'muito alta'} (-${Math.round(humidityPenalty)} pontos)`);
    } else if (latest.humidity < 40 || latest.humidity > 65) {
      const humidityPenalty = latest.humidity < 40 ? (40 - latest.humidity) * 0.8 : (latest.humidity - 65) * 0.8;
      comfortScore -= humidityPenalty;
      comfortFactors.push(`Umidade ${latest.humidity < 40 ? 'baixa' : 'elevada'} (-${Math.round(humidityPenalty)} pontos)`);
    }
    
    // Wind comfort (0-20 km/h is optimal)
    if (latest.windSpeed > 25) {
      const windPenalty = (latest.windSpeed - 25) * 2;
      comfortScore -= windPenalty;
      comfortFactors.push(`Ventos fortes (-${Math.round(windPenalty)} pontos)`);
    } else if (latest.windSpeed > 20) {
      const windPenalty = (latest.windSpeed - 20) * 1;
      comfortScore -= windPenalty;
      comfortFactors.push(`Ventos moderados (-${Math.round(windPenalty)} pontos)`);
    }
    
    // Pressure comfort (1013-1020 hPa is optimal)
    if (latest.pressure < 1005 || latest.pressure > 1025) {
      const pressurePenalty = Math.abs(latest.pressure - 1015) * 0.5;
      comfortScore -= pressurePenalty;
      comfortFactors.push(`Pressão ${latest.pressure < 1005 ? 'baixa' : 'alta'} (-${Math.round(pressurePenalty)} pontos)`);
    }
    
    // Visibility impact
    if (latest.visibility < 5000) {
      const visibilityPenalty = (5000 - latest.visibility) / 200;
      comfortScore -= visibilityPenalty;
      comfortFactors.push(`Baixa visibilidade (-${Math.round(visibilityPenalty)} pontos)`);
    }
    
    comfortScore = Math.max(0, Math.min(100, comfortScore));
    
    const getComfortLevel = (score: number) => {
      if (score >= 85) return 'Excelente';
      if (score >= 70) return 'Muito Bom';
      if (score >= 55) return 'Bom';
      if (score >= 40) return 'Regular';
      if (score >= 25) return 'Ruim';
      return 'Péssimo';
    };
    
    const getComfortDescription = (score: number) => {
      if (score >= 85) return 'Condições ideais para todas as atividades';
      if (score >= 70) return 'Muito confortável para atividades ao ar livre';
      if (score >= 55) return 'Adequado para a maioria das atividades';
      if (score >= 40) return 'Moderadamente confortável com pequenos ajustes';
      if (score >= 25) return 'Desconfortável, cuidados necessários';
      return 'Condições adversas, evite exposição prolongada';
    };
    
    // Historical comparison
    const historicalComparison = this.getHistoricalComparison(recent);
    
    // Activity recommendations based on current conditions
    const activityRecommendations = this.getActivityRecommendations(latest, comfortScore);
    
    const result = {
      summary: `${latest.condition} em ${latest.city}. ${latest.temperature}°C, sensação ${this.calculateFeelsLike(latest.temperature, latest.humidity, latest.windSpeed)}°C. Umidade ${latest.humidity}%, ventos ${latest.windSpeed} km/h.`,
      detailedSummary: `Condições ${getComfortLevel(comfortScore).toLowerCase()} para atividades. ${getComfortDescription(comfortScore)}`,
      comfortScore: Math.round(comfortScore),
      comfortLevel: getComfortLevel(comfortScore),
      comfortDescription: getComfortDescription(comfortScore),
      comfortFactors: comfortFactors.length > 0 ? comfortFactors : ['Condições ideais detectadas'],
      alerts,
      recommendations,
      predictions,
      detailedAnalysis,
      trends: this.analyzeTrends(recent),
      statistics: stats,
      historicalComparison,
      activityRecommendations,
      lastUpdated: new Date().toISOString(),
      dataQuality: this.assessDataQuality(recent)
    };

    const duration = Date.now() - startTime;
    this.logger.logInsightGeneration('comprehensive-weather-analysis', duration, recent.length);
    this.logger.logPerformanceMetric('insights-generation', duration, {
      dataPoints: recent.length,
      alertCount: alerts.length,
      recommendationCount: recommendations.length,
      predictionCount: predictions.length,
    });

    return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'Failed to generate weather insights',
        error.stack,
        'WeatherService',
        { duration },
      );
      
      throw new InsightGenerationError(error.message);
    }
  }
  
  private analyzeTrends(data: WeatherLog[]): any {
    if (data.length < 2) return { temperature: 'stable', humidity: 'stable', windSpeed: 'stable', pressure: 'stable' };
    
    const recent = data.slice(0, Math.min(6, data.length)); // Last 6 readings
    const older = data.slice(Math.min(6, data.length));
    
    if (older.length === 0) return { temperature: 'stable', humidity: 'stable', windSpeed: 'stable', pressure: 'stable' };
    
    const recentAvgTemp = recent.reduce((sum, d) => sum + d.temperature, 0) / recent.length;
    const olderAvgTemp = older.reduce((sum, d) => sum + d.temperature, 0) / older.length;
    
    const recentAvgHumidity = recent.reduce((sum, d) => sum + d.humidity, 0) / recent.length;
    const olderAvgHumidity = older.reduce((sum, d) => sum + d.humidity, 0) / older.length;
    
    const recentAvgWind = recent.reduce((sum, d) => sum + d.windSpeed, 0) / recent.length;
    const olderAvgWind = older.reduce((sum, d) => sum + d.windSpeed, 0) / older.length;
    
    const recentAvgPressure = recent.reduce((sum, d) => sum + d.pressure, 0) / recent.length;
    const olderAvgPressure = older.reduce((sum, d) => sum + d.pressure, 0) / older.length;
    
    const tempDiff = recentAvgTemp - olderAvgTemp;
    const humidityDiff = recentAvgHumidity - olderAvgHumidity;
    const windDiff = recentAvgWind - olderAvgWind;
    const pressureDiff = recentAvgPressure - olderAvgPressure;
    
    return {
      temperature: tempDiff > 2 ? 'rising' : tempDiff < -2 ? 'falling' : 'stable',
      humidity: humidityDiff > 5 ? 'rising' : humidityDiff < -5 ? 'falling' : 'stable',
      windSpeed: windDiff > 3 ? 'rising' : windDiff < -3 ? 'falling' : 'stable',
      pressure: pressureDiff > 2 ? 'rising' : pressureDiff < -2 ? 'falling' : 'stable',
      trendStrength: Math.abs(tempDiff) + Math.abs(humidityDiff) + Math.abs(windDiff),
    };
  }

  private calculateFeelsLike(temperature: number, humidity: number, windSpeed: number): number {
    // Heat Index calculation for temperatures above 26.7°C (80°F)
    if (temperature > 26.7) {
      const T = temperature;
      const RH = humidity;
      
      let heatIndex = -42.379 + (2.04901523 * T) + (10.14333127 * RH) 
        - (0.22475541 * T * RH) - (6.83783e-3 * T * T) 
        - (5.481717e-2 * RH * RH) + (1.22874e-3 * T * T * RH) 
        + (8.5282e-4 * T * RH * RH) - (1.99e-6 * T * T * RH * RH);
      
      // Convert from Fahrenheit to Celsius
      return Math.round((heatIndex - 32) * 5/9);
    }
    
    // Wind Chill calculation for temperatures below 10°C and wind > 4.8 km/h
    if (temperature < 10 && windSpeed > 4.8) {
      const windChill = 13.12 + (0.6215 * temperature) - (11.37 * Math.pow(windSpeed, 0.16)) 
        + (0.3965 * temperature * Math.pow(windSpeed, 0.16));
      return Math.round(windChill);
    }
    
    return Math.round(temperature);
  }

  private getHistoricalComparison(data: WeatherLog[]): any {
    if (data.length < 24) return null; // Need at least 24 hours of data
    
    const now = data[0];
    const dayAgo = data.slice(20, 28); // Around 24 hours ago
    const weekAgo = data.length > 168 ? data.slice(164, 172) : null; // Around 7 days ago
    
    const comparison = {
      vs24h: dayAgo.length > 0 ? {
        temperature: now.temperature - (dayAgo.reduce((sum, d) => sum + d.temperature, 0) / dayAgo.length),
        humidity: now.humidity - (dayAgo.reduce((sum, d) => sum + d.humidity, 0) / dayAgo.length),
      } : null,
      vs7d: weekAgo ? {
        temperature: now.temperature - (weekAgo.reduce((sum, d) => sum + d.temperature, 0) / weekAgo.length),
        humidity: now.humidity - (weekAgo.reduce((sum, d) => sum + d.humidity, 0) / weekAgo.length),
      } : null,
    };
    
    return comparison;
  }

  private getActivityRecommendations(weather: WeatherLog, comfortScore: number): string[] {
    const recommendations = [];
    
    // Activity recommendations based on weather conditions
    if (comfortScore >= 80) {
      recommendations.push('🏃‍♂️ Excelente para corrida e exercícios ao ar livre');
      recommendations.push('🚴‍♀️ Ideal para ciclismo e caminhadas');
      recommendations.push('🏖️ Perfeito para atividades na praia ou parque');
    } else if (comfortScore >= 60) {
      recommendations.push('🚶‍♂️ Adequado para caminhadas leves');
      recommendations.push('☕ Bom momento para atividades ao ar livre');
    } else if (comfortScore >= 40) {
      recommendations.push('🏠 Considere atividades internas');
      recommendations.push('🧥 Se sair, vista roupas apropriadas');
    } else {
      recommendations.push('⚠️ Evite atividades prolongadas ao ar livre');
      recommendations.push('🏠 Prefira ambientes climatizados');
    }
    
    // Specific weather-based recommendations
    if (weather.temperature > 30) {
      recommendations.push('🌡️ Evite exercícios intensos entre 10h-16h');
    }
    
    if (weather.windSpeed > 20) {
      recommendations.push('💨 Cuidado com esportes aquáticos');
    }
    
    if (weather.humidity > 80) {
      recommendations.push('💧 Mantenha-se bem hidratado');
    }
    
    if (weather.visibility < 1000) {
      recommendations.push('🚗 Dirija com cuidado - baixa visibilidade');
    }
    
    return recommendations;
  }

  private assessDataQuality(data: WeatherLog[]): any {
    const now = Date.now();
    const lastUpdate = new Date(data[0]?.timestamp).getTime();
    const dataAge = now - lastUpdate;
    
    let quality = 'excellent';
    let message = 'Dados atualizados e confiáveis';
    
    if (dataAge > 30 * 60 * 1000) { // 30 minutes
      quality = 'good';
      message = 'Dados ligeiramente desatualizados';
    }
    
    if (dataAge > 2 * 60 * 60 * 1000) { // 2 hours
      quality = 'fair';
      message = 'Dados podem estar desatualizados';
    }
    
    if (dataAge > 6 * 60 * 60 * 1000) { // 6 hours
      quality = 'poor';
      message = 'Dados significativamente desatualizados';
    }
    
    return {
      quality,
      message,
      lastUpdate: new Date(data[0]?.timestamp).toISOString(),
      dataPoints: data.length
    };
  }

  async exportToCsv(): Promise<string> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting CSV export');
      
      const data = await this.findAll();
      const csvContent = this.convertToCsv(data);
      
      const duration = Date.now() - startTime;
      this.logger.logExportActivity('CSV', data.length);
      this.logger.logPerformanceMetric('csv-export', duration, {
        recordCount: data.length,
        outputSize: csvContent.length,
      });
      
      return csvContent;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'Failed to export data as CSV',
        error.stack,
        'WeatherService',
        { duration },
      );
      
      throw new DataExportError('CSV', error.message);
    }
  }

  async exportToXlsx(): Promise<Buffer> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting Excel export');
      
      const data = await this.findAll();
      
      // Clean data - remove MongoDB internal fields and format dates
      const cleanData = data.map(item => ({
        timestamp: new Date(item.timestamp).toISOString(),
        city: item.city,
        country: item.country,
        temperature: item.temperature,
        humidity: item.humidity,
        windSpeed: item.windSpeed,
        condition: item.condition,
        description: item.description,
        pressure: item.pressure,
        visibility: item.visibility,
        cloudiness: item.cloudiness
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(cleanData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Data');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      const duration = Date.now() - startTime;
      this.logger.logExportActivity('XLSX', data.length);
      this.logger.logPerformanceMetric('xlsx-export', duration, {
        recordCount: data.length,
        outputSize: buffer.length,
      });
      
      return buffer;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(
        'Failed to export data as Excel',
        error.stack,
        'WeatherService',
        { duration },
      );
      
      throw new DataExportError('XLSX', error.message);
    }
  }

  private convertToCsv(data: WeatherLog[]): string {
    if (data.length === 0) return 'No data available';
    
    // Define headers manually to avoid MongoDB internal fields
    const headers = ['timestamp', 'city', 'country', 'temperature', 'humidity', 'windSpeed', 'condition', 'description', 'pressure', 'visibility', 'cloudiness'];
    const csvRows = [headers.join(',')];
    
    for (const item of data) {
      const values = headers.map(header => {
        let value = item[header];
        if (header === 'timestamp' && value) {
          value = new Date(value).toISOString();
        }
        return typeof value === 'string' ? `"${value}"` : (value ?? '');
      });
      csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
  }
}