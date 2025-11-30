import { Injectable, BadRequestException } from '@nestjs/common';
import { WeatherRepository } from './repositories/weather.repository';
import { CreateWeatherDto } from './dto/create-weather.dto';
import * as ExcelJS from 'exceljs';

@Injectable()
export class WeatherService {
  constructor(private readonly weatherRepository: WeatherRepository) {}

  async create(createWeatherDto: CreateWeatherDto) {
    this.validateWeatherPhysics(createWeatherDto);

    return this.weatherRepository.create(createWeatherDto);
  }

  async findAll() {
    return this.weatherRepository.findAll();
  }

  private validateWeatherPhysics(data: CreateWeatherDto) {
    if (data.humidity < 0 || data.humidity > 100) {
      throw new BadRequestException('A humidade deve estar entre 0 e 100%.');
    }

    if (data.temperature < -90 || data.temperature > 60) {
      throw new BadRequestException(`Temperatura implausível: ${data.temperature}°C. Verifique o sensor.`);
    }

    if (data.windSpeed < 0) {
      throw new BadRequestException('A velocidade do vento não pode ser negativa.');
    }

    const collectedDate = new Date(data.collectedAt);
    if (collectedDate > new Date()) {
      throw new BadRequestException('Não é possível registar dados climáticos do futuro.');
    }
  }

  async generateExcelLog(format: 'xlsx' | 'csv'): Promise<ExcelJS.Buffer> {
    const logs = await this.weatherRepository.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Histórico Climático');

    worksheet.columns = [
      { header: 'Data/Hora', key: 'collectedAt', width: 25 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 15 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      { header: 'Vento (km/h)', key: 'windSpeed', width: 15 },
      { header: 'Condição (Cód)', key: 'conditionCode', width: 15 },
      { header: 'Latitude', key: 'lat', width: 12 },
      { header: 'Longitude', key: 'lon', width: 12 },
    ];

    logs.forEach((log) => {
      const loc = log.location as any; 

      worksheet.addRow({
        collectedAt: log.collectedAt.toLocaleString('pt-BR'),
        temperature: log.temperature,
        humidity: log.humidity,
        windSpeed: log.windSpeed,
        conditionCode: log.conditionCode,
        lat: loc?.lat,
        lon: loc?.lon,
      });
    });

    if (format === 'csv') {
      return (await workbook.csv.writeBuffer()) as ExcelJS.Buffer;
    }
    return (await workbook.xlsx.writeBuffer()) as ExcelJS.Buffer;
  }

  async generateInsights() {
    const logs = await this.weatherRepository.findAll();
    const recentLogs = logs.slice(0, 24); 

    if (recentLogs.length === 0) {
      return { message: 'Dados insuficientes para gerar insights.' };
    }

    const totalTemp = recentLogs.reduce((acc, curr) => acc + curr.temperature, 0);
    const avgTemp = totalTemp / recentLogs.length;
    
    const totalHum = recentLogs.reduce((acc, curr) => acc + curr.humidity, 0);
    const avgHum = totalHum / recentLogs.length;

    const insights: string[] = [];

    if (avgTemp > 30) {
      insights.push('🔥 Onda de Calor: A média recente está acima de 30°C. Risco de desidratação.');
    } else if (avgTemp < 15) {
      insights.push('❄️ Frente Fria: Temperaturas abaixo da média. Recomenda-se agasalho.');
    } else {
      insights.push('✅ Conforto Térmico: A temperatura está estável e agradável.');
    }

    if (avgHum < 30) {
      insights.push('🌵 Ar Seco: Umidade crítica. Beba água e evite exercícios ao ar livre.');
    } else if (avgHum > 80) {
      insights.push('💧 Alta Umidade: Sensação térmica pode ser maior que a real. Possibilidade de chuva.');
    }

    const lastTemp = recentLogs[0].temperature; 
    const oldTemp = recentLogs[recentLogs.length - 1].temperature;
    
    if (lastTemp > oldTemp + 2) {
      insights.push('📈 Tendência de Aquecimento: A temperatura subiu nas últimas horas.');
    } else if (lastTemp < oldTemp - 2) {
      insights.push('📉 Tendência de Resfriamento: A temperatura está caindo.');
    }

    return {
      summary: {
        average_temperature: avgTemp.toFixed(1),
        average_humidity: avgHum.toFixed(1),
        samples_analyzed: recentLogs.length
      },
      ai_analysis: insights
    };
  }
}