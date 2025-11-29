import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { Weather, WeatherDocument } from './schemas/weather.schema';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) {}

  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    const createdWeather = new this.weatherModel(createWeatherDto);
    return createdWeather.save();
  }
  
  async findAll(): Promise<Weather[]> {
    return this.weatherModel.find().sort({ createdAt: -1 }).exec();
  }

  async getInsights() {
    const data = await this.weatherModel.find().sort({ createdAt: -1 }).limit(10).exec();
    
    if (!data || data.length === 0) {
      return { summary: "Dados insuficientes para análise." };
    }

    const current = data[0];
    const previous = data[1] || current; 

    let trend = "estável";
    if (current.temp_c > previous.temp_c) trend = "subindo";
    if (current.temp_c < previous.temp_c) trend = "caindo";

    const avgTemp = data.reduce((acc, curr) => acc + curr.temp_c, 0) / data.length;

    let analysis = "";
    
    if (current.rain_prob > 50) {
      analysis += "⚠️ Alta probabilidade de chuva detectada. Recomenda-se recolher equipamentos sensíveis. ";
    } else {
      analysis += "✅ Condições favoráveis sem risco iminente de chuva. ";
    }

    if (current.temp_c > 30) {
      analysis += "🌡️ Alerta de calor excessivo: eficiência dos painéis pode cair.";
    } else if (trend === "subindo") {
      analysis += "📈 Temperatura em tendência de alta nas últimas horas.";
    } else {
      analysis += "❄️ Temperatura estável ou em queda.";
    }

    return {
      current_temp: current.temp_c,
      trend,
      average_last_10: avgTemp.toFixed(1),
      analysis_text: analysis 
    };
  }

  async getCsv() {
    const data = await this.findAll();
    
    let csv = "Data,Hora,Latitude,Longitude,Temperatura(C),Umidade(%),Vento(km/h),Chuva(%)\n";

    data.forEach((log) => {
      const date = new Date(log['createdAt']);
      const dateStr = date.toLocaleDateString('pt-BR');
      const timeStr = date.toLocaleTimeString('pt-BR');

      csv += `${dateStr},${timeStr},${log.latitude},${log.longitude},${log.temp_c},${log.humidity},${log.wind_speed},${log.rain_prob}\n`;
    });

    return csv;
  }
}