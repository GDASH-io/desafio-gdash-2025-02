import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import axios from 'axios';

@Injectable()
export class WeatherCollectorService {
  private readonly logger = new Logger(WeatherCollectorService.name);

  // Florianópolis coordinates
  private readonly LATITUDE = -27.5954;
  private readonly LONGITUDE = -48.5480;
  private readonly LOCATION_NAME = 'Florianópolis';

  constructor(
    @InjectQueue('weather-queue') private weatherQueue: Queue,
  ) {}

  /**
   * Coleta dados climáticos a cada 30 minutos
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async collectWeatherData() {
    this.logger.log('🌦️  Iniciando coleta de dados climáticos...');

    try {
      const weatherData = await this.fetchWeatherFromOpenMeteo();

      // Enviar para RabbitMQ
      await this.weatherQueue.add('process-weather', weatherData);

      this.logger.log(`✅ Dados coletados: ${weatherData.temperature}°C, ${weatherData.condition}`);
    } catch (error) {
      this.logger.error('❌ Erro ao coletar dados climáticos:', error.message);
    }
  }

  /**
   * Busca dados da API Open-Meteo
   */
  private async fetchWeatherFromOpenMeteo() {
    const url = 'https://api.open-meteo.com/v1/forecast';

    const params = {
      latitude: this.LATITUDE,
      longitude: this.LONGITUDE,
      current: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation_probability',
        'weather_code',
        'wind_speed_10m',
        'apparent_temperature',
        'pressure_msl',
      ].join(','),
      timezone: 'America/Sao_Paulo',
    };

    const response = await axios.get(url, { params });
    const current = response.data.current;

    return {
      timestamp: new Date().toISOString(),
      location: {
        name: this.LOCATION_NAME,
        latitude: this.LATITUDE,
        longitude: this.LONGITUDE,
      },
      temperature: Math.round(current.temperature_2m * 10) / 10,
      humidity: Math.round(current.relative_humidity_2m),
      windSpeed: Math.round(current.wind_speed_10m * 10) / 10,
      condition: this.mapWeatherCode(current.weather_code),
      rainProbability: current.precipitation_probability || 0,
      feelsLike: Math.round(current.apparent_temperature * 10) / 10,
      pressure: Math.round(current.pressure_msl),
    };
  }

  /**
   * Mapeia códigos WMO para descrições em português
   * https://open-meteo.com/en/docs
   */
  private mapWeatherCode(code: number): string {
    const weatherCodes: Record<number, string> = {
      0: 'Céu limpo',
      1: 'Principalmente limpo',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Neblina',
      48: 'Neblina com geada',
      51: 'Garoa leve',
      53: 'Garoa moderada',
      55: 'Garoa forte',
      56: 'Garoa congelante leve',
      57: 'Garoa congelante forte',
      61: 'Chuva leve',
      63: 'Chuva moderada',
      65: 'Chuva forte',
      66: 'Chuva congelante leve',
      67: 'Chuva congelante forte',
      71: 'Neve leve',
      73: 'Neve moderada',
      75: 'Neve forte',
      77: 'Grãos de neve',
      80: 'Pancadas de chuva leves',
      81: 'Pancadas de chuva moderadas',
      82: 'Pancadas de chuva fortes',
      85: 'Pancadas de neve leves',
      86: 'Pancadas de neve fortes',
      95: 'Tempestade',
      96: 'Tempestade com granizo leve',
      99: 'Tempestade com granizo forte',
    };

    return weatherCodes[code] || 'Condição desconhecida';
  }

  /**
   * Coleta dados manualmente (útil para testar)
   */
  async collectNow() {
    this.logger.log('🔧 Coleta manual iniciada...');
    await this.collectWeatherData();
  }
}
