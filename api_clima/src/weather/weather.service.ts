import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { Weather, WeatherDocument } from './entities/weather.entity';

@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(Weather.name) private weatherModel: Model<WeatherDocument>,
  ) { }

  async create(createWeatherDto: CreateWeatherDto): Promise<Weather> {
    const createdWeather = new this.weatherModel(createWeatherDto);

    return await createdWeather.save();
  }

  private analisarTendencia(historico: Weather[]): string {
    if (historico.length < 2) return `Analisando tendência...`;

    const atual = historico[0].temperatura;
    const anterior = historico[historico.length - 1].temperatura;
    const variacao = atual - anterior;

    if (variacao > 2) return `📈 Tendência de ALTA (+${variacao.toFixed(1)}°C)`;

    if (variacao < -2)
      return `📉 Tendência de QUEDA (${variacao.toFixed(1)}°C)`;

    return `📊 Temperatura estável`;
  }

  private gerarConselho(temp: number, umidade: number, chuva: number): string {
    if (chuva > 0) {
      return `Vai chover (ou já está)! ☔ Pegue o guarda-chuva e cuidado no trânsito.`;
    }

    if (temp > 30) {
      return `Calor intenso! 🥵 Beba muita água e use protetor solar.`;
    }

    if (temp < 18) {
      return `Esfriou! 🧥 Melhor pegar um casaco antes de sair.`;
    }

    if (temp >= 20 && temp <= 28 && umidade < 80) {
      return `Tempo perfeito! 🏖️ Ótimo para ir à praia ou fazer exercícios ao ar livre.`;
    }

    return `Clima agradável e seguro. Aproveite! 😊`;
  }

  async findAll(): Promise<any[]> {
    const dados = await this.weatherModel.find().sort({ createdAt: -1 }).exec();

    return dados.map((d, index) => {
      const historicoMomentaneo = dados.slice(index);

      // Gera as duas partes da inteligência
      const tendencia = this.analisarTendencia(historicoMomentaneo);
      const conselho = this.gerarConselho(d.temperatura, d.umidade, d.chuva);

      return {
        ...d.toObject(),
        insight: `${tendencia} | ${conselho}`,
      };
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} weather`;
  }

  remove(id: number) {
    return `This action removes a #${id} weather`;
  }
}
