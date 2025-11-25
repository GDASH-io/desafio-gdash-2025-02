import { Injectable, Logger } from "@nestjs/common";
import { CreateWeatherLogDto } from "./dto/create-weather-log.dto";

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  async createWeatherLog(data: CreateWeatherLogDto) {
    this.logger.log("📨 Dados meteorológicos recebidos do Worker Go");
    this.logger.log(`📍 Local: ${data.location.city}, ${data.location.state}`);
    this.logger.log(
      `🌡️  Temperatura: ${data.weather.temperature}${data.weather.temperature_unit}`
    );
    this.logger.log(
      `💧 Umidade: ${data.weather.humidity}${data.weather.humidity_unit}`
    );
    this.logger.log(
      `💨 Vento: ${data.weather.wind_speed} ${data.weather.wind_speed_unit}`
    );
    this.logger.log(`☁️  Condição: ${data.weather.condition}`);
    this.logger.log(`🕐 Timestamp: ${data.timestamp}`);

    return {
      success: true,
      message: "Dados recebidos com sucesso",
      receivedAt: new Date().toISOString(),
    };
  }
}
