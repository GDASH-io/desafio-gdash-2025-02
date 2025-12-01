import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import * as ExcelJS from 'exceljs';
import { Response } from 'express';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    const weatherLog = new this.weatherLogModel(createWeatherLogDto);
    return weatherLog.save();
  }

  async findAll(limit = 100, skip = 0): Promise<WeatherLog[]> {
    return this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .exec();
  }

  async getInsights(): Promise<any> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean()
      .exec();

    if (logs.length === 0) {
      return {
        message: 'Dados insuficientes para gerar insights',
        data: null,
      };
    }

    const temperatures = logs
      .map((log) => log.temperature)
      .filter((t): t is number => typeof t === 'number' && !isNaN(t));

    const humidities = logs
      .map((log) => log.humidity)
      .filter((h): h is number => typeof h === 'number' && !isNaN(h));

    const windSpeeds = logs
      .map((log) => log.windSpeed)
      .filter((w): w is number => typeof w === 'number' && !isNaN(w));

    const precipitationProbs = logs
      .map((log) => log.precipitationProbability)
      .filter((p): p is number => typeof p === 'number' && !isNaN(p));

    const avgTemp = this.calculateAverage(temperatures);
    const avgHumidity = this.calculateAverage(humidities);
    const avgWindSpeed = this.calculateAverage(windSpeeds);
    const avgPrecipitation = this.calculateAverage(precipitationProbs);

    const minTemp = temperatures.length > 0 ? Math.min(...temperatures) : null;
    const maxTemp = temperatures.length > 0 ? Math.max(...temperatures) : null;
    const minHumidity = humidities.length > 0 ? Math.min(...humidities) : null;
    const maxHumidity = humidities.length > 0 ? Math.max(...humidities) : null;

    const recentLogs = logs.slice(0, 10);
    const olderLogs = logs.slice(10, 20);

    const recentTemps = recentLogs
      .map((log) => log.temperature)
      .filter((t): t is number => typeof t === 'number' && !isNaN(t));

    const olderTemps = olderLogs
      .map((log) => log.temperature)
      .filter((t): t is number => typeof t === 'number' && !isNaN(t));

    const recentAvgTemp = this.calculateAverage(recentTemps);
    const olderAvgTemp = this.calculateAverage(olderTemps);

    let temperatureTrend = 'estável';
    if (recentAvgTemp !== null && olderAvgTemp !== null) {
      const diff = recentAvgTemp - olderAvgTemp;
      if (diff > 2) {
        temperatureTrend = 'subindo';
      } else if (diff < -2) {
        temperatureTrend = 'descendo';
      }
    }

    const comfortScore = this.calculateComfortScore(
      avgTemp,
      avgHumidity,
      avgWindSpeed,
    );

    const dayClassification = this.classifyDay(comfortScore);

    const alerts = this.generateAlerts(logs[0]);

    const conditionCounts = this.countConditions(logs);
    const mostCommonCondition = this.getMostCommon(conditionCounts);

    const locationName = logs[0]?.location?.name || 'Localização desconhecida';
    const summary = this.generateSummary(
      locationName,
      avgTemp,
      avgHumidity,
      avgWindSpeed,
      temperatureTrend,
      dayClassification,
      alerts,
      logs.length,
    );

    return {
      summary,
      statistics: {
        averageTemperature: avgTemp !== null ? this.round(avgTemp, 1) : null,
        averageHumidity:
          avgHumidity !== null ? this.round(avgHumidity, 1) : null,
        averageWindSpeed:
          avgWindSpeed !== null ? this.round(avgWindSpeed, 1) : null,
        averagePrecipitation:
          avgPrecipitation !== null ? this.round(avgPrecipitation, 1) : null,
        minTemperature: minTemp !== null ? this.round(minTemp, 1) : null,
        maxTemperature: maxTemp !== null ? this.round(maxTemp, 1) : null,
        minHumidity: minHumidity !== null ? this.round(minHumidity, 1) : null,
        maxHumidity: maxHumidity !== null ? this.round(maxHumidity, 1) : null,
        totalRecords: logs.length,
        recordsWithData: {
          temperature: temperatures.length,
          humidity: humidities.length,
          windSpeed: windSpeeds.length,
          precipitation: precipitationProbs.length,
        },
      },
      trends: {
        temperature: temperatureTrend,
      },
      comfort: {
        score: Math.round(comfortScore),
        classification: dayClassification,
      },
      alerts,
      mostCommonCondition,
      latest: {
        temperature: logs[0].temperature,
        humidity: logs[0].humidity,
        windSpeed: logs[0].windSpeed,
        condition: logs[0].condition,
        timestamp: logs[0].timestamp,
        precipitationProbability: logs[0].precipitationProbability,
        weatherCode: logs[0].weatherCode,
        location: logs[0].location,
      },
    };
  }

  private calculateAverage(values: number[]): number | null {
    if (values.length === 0) return null;
    const sum = values.reduce((a, b) => a + b, 0);
    return sum / values.length;
  }

  private round(value: number, decimals: number): number {
    const multiplier = Math.pow(10, decimals);
    return Math.round(value * multiplier) / multiplier;
  }

  private calculateComfortScore(
    avgTemp: number | null,
    avgHumidity: number | null,
    avgWindSpeed: number | null,
  ): number {
    let comfortScore = 50;

    if (avgTemp !== null) {
      if (avgTemp >= 20 && avgTemp <= 26) {
        comfortScore += 20;
      } else if (avgTemp >= 18 && avgTemp <= 28) {
        comfortScore += 10;
      } else if (avgTemp >= 15 && avgTemp <= 30) {
        comfortScore += 5;
      } else if (avgTemp < 10 || avgTemp > 35) {
        comfortScore -= 30;
      } else if (avgTemp < 15 || avgTemp > 30) {
        comfortScore -= 15;
      }
    }

    if (avgHumidity !== null) {
      if (avgHumidity >= 40 && avgHumidity <= 60) {
        comfortScore += 15;
      } else if (avgHumidity >= 30 && avgHumidity <= 70) {
        comfortScore += 5;
      } else if (avgHumidity < 30 || avgHumidity > 70) {
        comfortScore -= 15;
      }
    }

    if (avgWindSpeed !== null) {
      if (avgWindSpeed >= 5 && avgWindSpeed <= 15) {
        comfortScore += 10;
      } else if (avgWindSpeed > 25) {
        comfortScore -= 20;
      } else if (avgWindSpeed > 15 && avgWindSpeed <= 25) {
        comfortScore -= 5;
      }
    }

    return Math.max(0, Math.min(100, comfortScore));
  }

  private classifyDay(comfortScore: number): string {
    if (comfortScore >= 80) return 'muito agradável';
    if (comfortScore >= 60) return 'agradável';
    if (comfortScore >= 40) return 'moderado';
    if (comfortScore >= 20) return 'desconfortável';
    return 'muito desconfortável';
  }

  private generateAlerts(latestLog: any): string[] {
    const alerts: string[] = [];

    if (latestLog.temperature !== null && latestLog.temperature !== undefined) {
      if (latestLog.temperature > 35) {
        alerts.push('🔥 Calor extremo');
      } else if (latestLog.temperature < 5) {
        alerts.push('🥶 Frio intenso');
      } else if (latestLog.temperature > 32) {
        alerts.push('☀️ Temperatura muito alta');
      }
    }

    if (
      latestLog.precipitationProbability !== null &&
      latestLog.precipitationProbability !== undefined
    ) {
      if (latestLog.precipitationProbability > 70) {
        alerts.push('🌧️ Alta chance de chuva');
      } else if (latestLog.precipitationProbability > 50) {
        alerts.push('☁️ Possibilidade de chuva');
      }
    }

    if (latestLog.humidity !== null && latestLog.humidity !== undefined) {
      if (latestLog.humidity > 80) {
        alerts.push('💧 Umidade muito alta');
      } else if (latestLog.humidity < 30) {
        alerts.push('🏜️ Ar muito seco');
      }
    }

    if (latestLog.windSpeed !== null && latestLog.windSpeed !== undefined) {
      if (latestLog.windSpeed > 30) {
        alerts.push('💨 Vento forte');
      } else if (latestLog.windSpeed > 40) {
        alerts.push('🌪️ Vento muito forte');
      }
    }

    return alerts;
  }

  private countConditions(logs: any[]): Map<string, number> {
    const counts = new Map<string, number>();
    logs.forEach((log) => {
      if (log.condition) {
        const count = counts.get(log.condition) || 0;
        counts.set(log.condition, count + 1);
      }
    });
    return counts;
  }

  private getMostCommon(counts: Map<string, number>): string | null {
    if (counts.size === 0) return null;
    let maxCount = 0;
    let mostCommon = null;
    counts.forEach((count, condition) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = condition;
      }
    });
    return mostCommon;
  }

  private generateSummary(
    location: string,
    avgTemp: number | null,
    avgHumidity: number | null,
    avgWindSpeed: number | null,
    trend: string,
    classification: string,
    alerts: string[],
    recordCount: number,
  ): string {
    let summary = `📊 Análise climática para ${location}\n\n`;

    if (avgTemp !== null) {
      const tempText =
        trend === 'subindo'
          ? 'com tendência de aumento'
          : trend === 'descendo'
            ? 'com tendência de queda'
            : 'com tendência estável';
      summary += `🌡️ Temperatura média: ${this.round(avgTemp, 1)}°C ${tempText}\n`;
    }

    if (avgHumidity !== null) {
      summary += `💧 Umidade média: ${this.round(avgHumidity, 1)}%\n`;
    }

    if (avgWindSpeed !== null) {
      summary += `🌬️ Velocidade média do vento: ${this.round(avgWindSpeed, 1)} km/h\n`;
    }

    summary += `\n☁️ Clima classificado como: "${classification}"\n`;

    if (alerts.length > 0) {
      summary += `\n⚠️ Alertas ativos:\n${alerts.map((a) => `  • ${a}`).join('\n')}\n`;
    } else {
      summary += `\n✅ Nenhum alerta ativo\n`;
    }

    summary += `\n📈 Análise baseada em ${recordCount} registros recentes`;

    return summary;
  }

  private formatTimestamp(timestamp: any): string {
    if (!timestamp) return '';

    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';

      return format(date, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
    } catch (error) {
      return '';
    }
  }

  private escapeCSV(value: any): string {
    if (value === null || value === undefined) return '';

    let cell = String(value);

    if (/[",\n]/.test(cell)) {
      cell = cell.replace(/"/g, '""');
      return `"${cell}"`;
    }

    return cell;
  }

  async exportToCSV(res: Response): Promise<void> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .lean()
      .exec();

    const headers = [
      'Data/Hora',
      'Local',
      'Latitude',
      'Longitude',
      'Temperatura (°C)',
      'Umidade (%)',
      'Velocidade do Vento (km/h)',
      'Condição',
      'Código do Tempo',
      'Probabilidade de Chuva (%)',
    ];

    const rows = logs.map((log) => [
      this.formatTimestamp(log.timestamp),
      log.location?.name || '',
      log.location?.lat ?? '',
      log.location?.lon ?? '',
      log.temperature ?? '',
      log.humidity ?? '',
      log.windSpeed ?? '',
      log.condition || '',
      log.weatherCode ?? '',
      log.precipitationProbability ?? '',
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather_logs.csv',
    );

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => this.escapeCSV(cell)).join(','))
      .join('\n');

    res.send('\ufeff' + csvContent);
  }

  async exportToXLSX(res: Response): Promise<void> {
    const logs = await this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .lean()
      .exec();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Dados Climáticos');

    worksheet.columns = [
      { header: 'Data/Hora', key: 'timestamp', width: 25 },
      { header: 'Local', key: 'location', width: 20 },
      { header: 'Latitude', key: 'lat', width: 12 },
      { header: 'Longitude', key: 'lon', width: 12 },
      { header: 'Temperatura (°C)', key: 'temperature', width: 18 },
      { header: 'Umidade (%)', key: 'humidity', width: 15 },
      {
        header: 'Velocidade do Vento (km/h)',
        key: 'windSpeed',
        width: 25,
      },
      { header: 'Condição', key: 'condition', width: 25 },
      { header: 'Código do Tempo', key: 'weatherCode', width: 18 },
      {
        header: 'Probabilidade de Chuva (%)',
        key: 'precipitation',
        width: 25,
      },
    ];

    logs.forEach((log) => {
      worksheet.addRow({
        timestamp: this.formatTimestamp(log.timestamp),
        location: log.location?.name || '',
        lat: log.location?.lat || '',
        lon: log.location?.lon || '',
        temperature:
          log.temperature !== null && log.temperature !== undefined
            ? log.temperature
            : '',
        humidity:
          log.humidity !== null && log.humidity !== undefined
            ? log.humidity
            : '',
        windSpeed:
          log.windSpeed !== null && log.windSpeed !== undefined
            ? log.windSpeed
            : '',
        condition: log.condition || '',
        weatherCode:
          log.weatherCode !== null && log.weatherCode !== undefined
            ? log.weatherCode
            : '',
        precipitation:
          log.precipitationProbability !== null &&
          log.precipitationProbability !== undefined
            ? log.precipitationProbability
            : '',
      });
    });

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    worksheet
      .getColumn('temperature')
      .eachCell({ includeEmpty: false }, (cell, rowNumber) => {
        if (rowNumber > 1 && typeof cell.value === 'number') {
          if (cell.value > 30) {
            cell.font = { color: { argb: 'FFFF0000' } };
          } else if (cell.value < 15) {
            cell.font = { color: { argb: 'FF0000FF' } };
          }
        }
      });

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=weather_logs.xlsx',
    );

    await workbook.xlsx.write(res);
    res.end();
  }
}
