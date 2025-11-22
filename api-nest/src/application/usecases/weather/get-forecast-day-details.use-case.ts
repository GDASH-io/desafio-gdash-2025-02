import { Injectable } from '@nestjs/common';
import * as https from 'https';

export interface HourlyForecast {
  time: string;
  temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
  cloud_cover: number;
  weather_code: number;
  pressure?: number;
  uv_index?: number;
}

@Injectable()
export class GetForecastDayDetailsUseCase {
  private readonly OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
  private readonly LATITUDE = -19.5186; // Coronel Fabriciano
  private readonly LONGITUDE = -42.6289;
  private readonly TIMEZONE = 'America/Sao_Paulo';

  async execute(date: string): Promise<HourlyForecast[]> {
    try {
      // Converter data para formato YYYY-MM-DD se necessário
      const targetDate = date.includes('T') ? date.split('T')[0] : date;
      
      const params = new URLSearchParams({
        latitude: this.LATITUDE.toString(),
        longitude: this.LONGITUDE.toString(),
        timezone: this.TIMEZONE,
        hourly: 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,cloud_cover,weather_code,pressure_msl,uv_index',
        start_date: targetDate,
        end_date: targetDate,
      });

      const url = `${this.OPEN_METEO_URL}?${params.toString()}`;
      const response = await this.httpGet(url);
      const data = JSON.parse(response);

      const hourly = data.hourly;
      if (!hourly || !hourly.time || hourly.time.length === 0) {
        return [];
      }

      const forecasts: HourlyForecast[] = [];
      const times = hourly.time || [];
      const temperatures = hourly.temperature_2m || [];
      const humidities = hourly.relative_humidity_2m || [];
      const precipitations = hourly.precipitation || [];
      const windSpeeds = hourly.wind_speed_10m || [];
      const cloudCovers = hourly.cloud_cover || [];
      const weatherCodes = hourly.weather_code || [];
      const pressures = hourly.pressure_msl || [];
      const uvIndices = hourly.uv_index || [];

      for (let i = 0; i < times.length; i++) {
        forecasts.push({
          time: times[i],
          temperature: temperatures[i] || 0,
          humidity: humidities[i] || 0,
          precipitation: precipitations[i] || 0,
          wind_speed: windSpeeds[i] || 0,
          cloud_cover: cloudCovers[i] || 0,
          weather_code: weatherCodes[i] || 0,
          pressure: pressures[i],
          uv_index: uvIndices[i],
        });
      }

      return forecasts;
    } catch (error: any) {
      console.error('Erro ao buscar detalhes do dia:', error);
      
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
        console.warn('Timeout ou erro de conexão ao buscar detalhes. Retornando array vazio.');
        return [];
      }
      
      // Para qualquer outro erro, também retornar array vazio
      console.warn('Erro ao buscar detalhes, retornando array vazio:', errorMessage);
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

