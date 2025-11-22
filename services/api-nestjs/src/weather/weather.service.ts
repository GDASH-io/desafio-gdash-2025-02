import { Injectable } from '@nestjs/common';
import { logsWeatherDTO } from '../DTO/logsWeather.dto';

@Injectable()
export class WeatherService {
  teste: logsWeatherDTO[] = [];

  async logWeatherPost(logsWeather: logsWeatherDTO) {
    await Promise.resolve();

    console.log('Dados de clima recebidos:', logsWeather);
    this.teste.push(logsWeather); // simulando uma operação de armazenamento
  }

  async logWeatherGet() {
    await Promise.resolve();

    return this.teste; // retornando os dados armazenados
  }
}
