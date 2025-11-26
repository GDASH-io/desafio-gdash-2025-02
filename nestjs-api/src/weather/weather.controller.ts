import { Controller, Get, Post, Body, Res, HttpStatus, Query, ParseFloatPipe } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherLog } from './schemas/weather-log.schema';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AiService, FullWeatherData } from '../ai/ai.service'; 

@ApiTags('Clima')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly aiService: AiService, 
  ) {}

  @Get('forecast')
  @ApiOperation({ summary: 'Obter previsão do tempo por latitude e longitude' })
  @ApiQuery({ name: 'latitude', type: Number, description: 'Latitude para a previsão do tempo' })
  @ApiQuery({ name: 'longitude', type: Number, description: 'Longitude para a previsão do tempo' })
  async getWeatherForecast(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
  ) {
    return this.weatherService.getWeatherForecast(latitude, longitude);
  }

  @Get('ai-insights')
  @ApiOperation({ summary: 'Obter insights de IA sobre o clima por latitude e longitude' })
  @ApiQuery({ name: 'latitude', type: Number, description: 'Latitude para a previsão do tempo' })
  @ApiQuery({ name: 'longitude', type: Number, description: 'Longitude para a previsão do tempo' })
  async getAiInsights(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
  ) {
    const weatherForecast = await this.weatherService.getWeatherForecast(latitude, longitude);

    const fullWeatherData: FullWeatherData = {
      temperature: weatherForecast.current_weather.temperature,
      apparent_temperature: weatherForecast.hourly.apparent_temperature?.[0] || weatherForecast.current_weather.temperature, 
      rain: weatherForecast.hourly.precipitation_probability?.[0] || 0, 
      wind_speed: weatherForecast.current_weather.windspeed,
      humidity: weatherForecast.hourly.relative_humidity_2m?.[0] || 0, 
      weathercode: weatherForecast.current_weather.weathercode,
      precipitation_probability: weatherForecast.hourly.precipitation_probability[0],
      hourly_units: weatherForecast.hourly_units,
      hourly: weatherForecast.hourly,
    };

    const explainedWeather = this.aiService.explainWeather({
      temperature: fullWeatherData.temperature,
      rain: fullWeatherData.rain,
      wind: fullWeatherData.wind_speed,
      humidity: fullWeatherData.humidity,
    });
    const healthAlerts = this.aiService.generateHealthAlerts(fullWeatherData);
    const smartAlerts = this.aiService.generateSmartAlerts(fullWeatherData);
    const activityRecommendations = this.aiService.getActivityRecommendations(fullWeatherData);
    const clothingSuggestions = this.aiService.getClothingSuggestions(fullWeatherData);
    const daySummary = this.aiService.getDaySummary(fullWeatherData);
    const moodInsights = this.aiService.getMoodInsights(fullWeatherData);
    const movieRecommendations = this.aiService.getMovieRecommendationsByWeather(fullWeatherData);

    return {
      weatherForecast,
      explainedWeather,
      healthAlerts,
      smartAlerts,
      activityRecommendations,
      clothingSuggestions,
      daySummary,
      moodInsights,
      movieRecommendations,
    };
  }

  @Post('logs')
  @ApiOperation({ summary: 'Cria um novo registro de log de clima' })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Retorna todos os registros de log de clima' })
  async findAll(): Promise<WeatherLog[]> {
    return this.weatherService.findAll();
  }

  @Get('insights')
  @ApiOperation({ summary: 'Retorna insights sobre os dados de clima' })
  async getInsights() {
    const averageTemperature = await this.weatherService.getAverageTemperature();
    const temperatureTrend = await this.weatherService.getTemperatureTrend();
    return {
      averageTemperature: parseFloat(averageTemperature.toFixed(2)),
      temperatureTrend,
      message: `A temperatura média é de ${averageTemperature.toFixed(2)}°C. ${temperatureTrend}`,
    };
  }

  @Get('export.csv')
  @ApiOperation({ summary: 'Exporta registros de clima para CSV' })
  async exportCsv(@Res() res: Response) {
    try {
      const data = await this.weatherService.findAll();
      const csv = await this.weatherService.exportCsv();
      res.header('Content-Type', 'text/csv');
      res.attachment('weather_logs.csv');
      return res.send(csv);
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Erro ao exportar dados CSV.');
    }
  }

  @Get('export.xlsx')
  @ApiOperation({ summary: 'Exporta registros de clima para XLSX' })
  async exportXlsx(@Res() res: Response) {
    try {
      const buffer = await this.weatherService.exportXlsx();
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('weather_logs.xlsx');
      return res.send(buffer);
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Erro ao exportar dados XLSX.');
    }
  }
}
