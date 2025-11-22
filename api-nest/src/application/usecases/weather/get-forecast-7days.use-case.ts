import { Injectable } from '@nestjs/common';
import * as https from 'https';

export interface ForecastDay {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation: number;
  wind_speed_max: number;
  cloud_cover: number;
  weather_code: number;
}

@Injectable()
export class GetForecast7DaysUseCase {
  private readonly OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
  private readonly LATITUDE = -19.5186; // Coronel Fabriciano
  private readonly LONGITUDE = -42.6289;
  private readonly TIMEZONE = 'America/Sao_Paulo';

  async execute(): Promise<ForecastDay[]> {
    try {
      const params = new URLSearchParams({
        latitude: this.LATITUDE.toString(),
        longitude: this.LONGITUDE.toString(),
        timezone: this.TIMEZONE,
        daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,cloud_cover_mean,weather_code',
        forecast_days: '7',
      });

      const url = `${this.OPEN_METEO_URL}?${params.toString()}`;
      const response = await this.httpGet(url);
      const data = JSON.parse(response);

      const daily = data.daily;
      if (!daily || !daily.time || daily.time.length === 0) {
        return [];
      }

      const forecast: ForecastDay[] = [];
      const days = daily.time.length;

      for (let i = 0; i < days; i++) {
        forecast.push({
          date: daily.time[i],
          temperature_max: daily.temperature_2m_max[i] || 0,
          temperature_min: daily.temperature_2m_min[i] || 0,
          precipitation: daily.precipitation_sum[i] || 0,
          wind_speed_max: daily.wind_speed_10m_max[i] || 0,
          cloud_cover: daily.cloud_cover_mean[i] || 0,
          weather_code: daily.weather_code[i] || 0,
        });
      }

      return forecast;
    } catch (error: any) {
      console.error('Erro ao buscar previsão de 7 dias:', error);
      
      // Retornar array vazio em caso de erro de conexão/timeout
      // para não quebrar o frontend
      const errorMessage = error?.message || error?.toString() || '';
      const errorCode = error?.code || '';
      
      if (
        errorMessage.includes('timeout') || 
        errorMessage.includes('ETIMEDOUT') || 
        errorMessage.includes('ENETUNREACH') ||
        errorCode === 'ETIMEDOUT' ||
        errorCode === 'ENETUNREACH' ||
        errorCode === 'ECONNREFUSED' ||
        errorMessage.includes('connect') ||
        errorMessage.includes('Connection')
      ) {
        console.warn('Timeout ou erro de conexão ao buscar previsão. Retornando array vazio.');
        return [];
      }
      
      // Para qualquer outro erro, também retornar array vazio para não quebrar o frontend
      console.warn('Erro ao buscar previsão, retornando array vazio:', errorMessage);
      return [];
    }
  }

  private httpGet(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = 10000; // 10 segundos
      const request = https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      });

      request.on('error', (err) => {
        reject(err);
      });

      request.on('timeout', () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });

      request.setTimeout(timeout);
    });
  }
}

