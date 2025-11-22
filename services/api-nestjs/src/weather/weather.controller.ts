import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { logsWeatherDTO } from '../DTO/logsWeather.dto';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call
@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('teste')
  async logWeatherData(@Body() logsWeather: logsWeatherDTO) {
    await this.weatherService.logWeatherPost(logsWeather);
  }

  @Get('teste')
  async getTest() {
    const data = await this.weatherService.logWeatherGet();
    return data;
  }
}
