import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Weather, WeatherDocument } from './schemas/weather.schema';
import * as xlsx from 'xlsx';
import { unparse } from 'papaparse';

interface CreateWeatherDto {
  latitude: number;
  longitude: number;
  temperature: number;
  wind_speed: number;
  time: string;
}

@Injectable()
export class WeatherService {

  private readonly logger = new Logger(WeatherService.name);
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) { }

  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    console.log('dado do clima recebidos:', createWeatherDto);
    const createdWeather = new this.weatherModel(createWeatherDto);
    return createdWeather.save();
  }

  async findAll(): Promise<Weather[]> {
    // this.logger.log('Buscando Registros de CLima');
    return this.weatherModel.find().sort({ time: -1 }).limit(50).exec();
  }

  async getInsights(): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 1); //DEFINIDO 24HORAS ATRAS
    this.logger.log(`Buscando dados a partir de: ${startDate.toISOString()}`);

    // time = $gte
    const recentLogs = await this.weatherModel.find({ time: { $gte: startDate } }).sort({ time: 'asc' }).exec();
    this.logger.log(`Encontrados ${recentLogs.length} registros`);

    if (recentLogs.length < 2) {
      this.logger.warn('Não há dados suficientes para gerar os insides');
      return { message: 'Dados insuficientes para análise' };
    }

    //registro mais recente
    const latestLog = recentLogs[recentLogs.length - 1];
    const currentTemperature = latestLog.temperature;

    const temperatures = recentLogs.map(log => log.temperature);
    // CALCULO MAXIMO ,MINIMO E MEDIA
    const minTemp = Math.min(...temperatures);
    const maxTemp = Math.max(...temperatures);
    const avgTemp = temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length;

    //LOGICA PRA TEMP
    let classification: string;
    if (currentTemperature >= 30) {

      classification = 'Calor Intenso';

    } else if (currentTemperature >= 25) {

      classification = 'Dia Quente';

    } else if (currentTemperature < 18) {

      classification = 'Dia Frio';

    } else {

      classification = 'Clima Agradável';
    }

    const insights = {
      current: {
        temperature: currentTemperature,
        wind_speed: latestLog.wind_speed,
        time: latestLog.time,
        classification: classification,
      },
      analysis24h: {
        minTemperature: minTemp.toFixed(1),
        maxTemperature: maxTemp.toFixed(1),
        avgTemperature: avgTemp.toFixed(1),
        dataPoints: recentLogs.length,
      },
      summary: `A temperatura atual em Pernambuco é de ${currentTemperature}°C (${classification}). A média das últimas 24h foi de ${avgTemp.toFixed(1)}°C.`
    };


    return insights;
  }

  async exportToCSV(): Promise<string> {
    this.logger.log('Gerando exportação para CSV...');
    const weatherLogs = await this.findAll() 

    if (weatherLogs.length === 0) {
      return ''; 
    }

    const formattedData = weatherLogs.map(log => ({
      'Horário da Coleta': new Date(log.time).toLocaleString('pt-BR'),
      'Temperatura (°C)': log.temperature,
      'Velocidade do Vento (km/h)': log.wind_speed,
    }));

    //o parapase converte o json em string csv
    const csv = unparse(formattedData);
    return csv;
  }

  async exportToXLSX(): Promise<Buffer> {
    this.logger.log('Gerando exportação para XLSX');
    const weatherLogs = await this.findAll();

    if (weatherLogs.length === 0) {
      return Buffer.from([]); 
    }
    
    //CRIAÇÃO
    const formattedData = weatherLogs.map(log => ({
        'Horário da Coleta': new Date(log.time).toLocaleString('pt-BR'),
        'Temperatura (°C)': log.temperature,
        'Velocidade do Vento (km/h)': log.wind_speed,
      }));

    const worksheet = xlsx.utils.json_to_sheet(formattedData);
    const workbook = xlsx.utils.book_new();

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Histórico de Clima');
    
    //TRANSFORMA NO BUUFFER
    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return buffer;
  }

}