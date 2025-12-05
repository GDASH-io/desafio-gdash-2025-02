import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { WeatherService } from './weather.service';
import { WeatherInsightsService } from './weather-insights.service';
import { CreateWeatherLogDto } from './weather.dto';

@Injectable()
export class WeatherCollectorService {
  private readonly logger = new Logger(WeatherCollectorService.name);
  private readonly openMeteoUrl: string;
  private readonly latitude: number;
  private readonly longitude: number;

  constructor(
    private readonly weatherService: WeatherService,
    @Inject(forwardRef(() => WeatherInsightsService))
    private readonly insightsService: WeatherInsightsService,
    private readonly configService: ConfigService,
  ) {
    this.openMeteoUrl =
      this.configService.get<string>('OPEN_METEO_URL') ||
      'https://api.open-meteo.com/v1/forecast';
    this.latitude = parseFloat(
      this.configService.get<string>('LATITUDE') || '52.52',
    );
    this.longitude = parseFloat(
      this.configService.get<string>('LONGITUDE') || '13.41',
    );
  }

  async collectWeatherData(): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      this.logger.log('Iniciando coleta manual de dados climáticos...');

      const params = {
        latitude: this.latitude,
        longitude: this.longitude,
        current:
          'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code,precipitation_probability,pressure_msl,visibility,shortwave_radiation',
        hourly:
          'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation_probability,weather_code',
        timezone: 'America/Sao_Paulo',
      };

      const response = await axios.get(this.openMeteoUrl, {
        params,
        timeout: 15000,
      });

      if (!response.data?.current) {
        throw new Error('Resposta da API não contém dados atuais');
      }

      const current = response.data.current;
      const locationName = this.getLocationName();

      // Usar timestamp atual
      const now = new Date();
      const timestampStr = now.toISOString();

      // Processar campos opcionais
      const visibilityValue = current.visibility;
      const visibilityKm =
        visibilityValue && visibilityValue > 0
          ? visibilityValue / 1000
          : undefined;

      const solarRadiationValue = current.shortwave_radiation;
      const solarRadiation =
        solarRadiationValue && solarRadiationValue >= 0
          ? solarRadiationValue
          : undefined;

      const pressureMslValue = current.pressure_msl;
      const pressureHpa =
        pressureMslValue && pressureMslValue > 0
          ? pressureMslValue / 100
          : undefined;

      const weatherData: CreateWeatherLogDto = {
        timestamp: timestampStr,
        location: locationName,
        latitude: this.latitude,
        longitude: this.longitude,
        temperature: current.temperature_2m || 0,
        humidity: current.relative_humidity_2m || 0,
        windSpeed: current.wind_speed_10m || 0,
        windDirection: current.wind_direction_10m || undefined,
        condition: this.getWeatherConditionPt(current.weather_code || 0),
        rainProbability: current.precipitation_probability || 0,
        description: this.getWeatherDescription(current.weather_code || 0),
        visibility: visibilityKm,
        solarRadiation: solarRadiation,
        pressure: pressureHpa,
      };

      // Salvar no banco de dados
      const savedLog = await this.weatherService.create(weatherData);

      // Invalidar cache de insights para forçar atualização com novos dados
      this.insightsService.invalidateCache();

      this.logger.log(
        `Coleta manual concluída: ${weatherData.temperature}°C em ${locationName}`,
      );

      return {
        success: true,
        message: 'Dados climáticos coletados com sucesso',
        data: savedLog,
      };
    } catch (error: any) {
      this.logger.error('Erro na coleta manual de dados:', error);
      return {
        success: false,
        message:
          error.response?.data?.error ||
          error.message ||
          'Erro ao coletar dados climáticos',
      };
    }
  }

  private getLocationName(): string {
    // Pode ser melhorado para usar geocoding reverso
    return `${this.latitude.toFixed(2)}, ${this.longitude.toFixed(2)}`;
  }

  private getWeatherConditionPt(weatherCode: number): string {
    const conditions: Record<number, string> = {
      0: 'Céu limpo',
      1: 'Principalmente limpo',
      2: 'Parcialmente nublado',
      3: 'Nublado',
      45: 'Nevoeiro',
      48: 'Nevoeiro depositante',
      51: 'Garoa leve',
      53: 'Garoa moderada',
      55: 'Garoa densa',
      56: 'Garoa leve congelante',
      57: 'Garoa densa congelante',
      61: 'Chuva leve',
      63: 'Chuva moderada',
      65: 'Chuva forte',
      66: 'Chuva leve congelante',
      67: 'Chuva forte congelante',
      71: 'Queda de neve leve',
      73: 'Queda de neve moderada',
      75: 'Queda de neve forte',
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

    return conditions[weatherCode] || 'Condição desconhecida';
  }

  private getWeatherDescription(weatherCode: number): string {
    const descriptions: Record<number, string> = {
      0: 'Céu completamente limpo',
      1: 'Algumas nuvens esparsas',
      2: 'Nuvens parcialmente cobrindo o céu',
      3: 'Céu completamente nublado',
      45: 'Nevoeiro reduzindo a visibilidade',
      48: 'Nevoeiro com depósito de geada',
      51: 'Garoa leve',
      53: 'Garoa moderada',
      55: 'Garoa densa',
      61: 'Chuva leve',
      63: 'Chuva moderada',
      65: 'Chuva forte',
      71: 'Queda de neve leve',
      73: 'Queda de neve moderada',
      75: 'Queda de neve forte',
      80: 'Pancadas de chuva leves',
      81: 'Pancadas de chuva moderadas',
      82: 'Pancadas de chuva fortes',
      95: 'Tempestade com trovões',
      96: 'Tempestade com granizo',
      99: 'Tempestade severa com granizo',
    };

    return descriptions[weatherCode] || 'Condições climáticas variáveis';
  }
}

