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
      uv_index: weatherForecast.hourly.uv_index?.[0] || weatherForecast.daily?.uv_index_max?.[0] || undefined,
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
    const detailedClothingSuggestions = this.aiService.getDetailedClothingSuggestions(fullWeatherData);
    const daySummary = this.aiService.getDaySummary(fullWeatherData);
    const moodInsights = this.aiService.getMoodInsights(fullWeatherData);
    const movieRecommendations = this.aiService.getMovieRecommendationsByWeather(fullWeatherData);
    const apparentTemperatureExplanation = this.aiService.getApparentTemperatureExplanation(fullWeatherData);
    const uvIndexAlert = fullWeatherData.uv_index ? this.aiService.getUvIndexAlert(fullWeatherData.uv_index) : null;
    const healthAndWellnessConditions = this.aiService.getHealthAndWellnessConditions(fullWeatherData);

    return {
      weatherForecast,
      explainedWeather,
      healthAlerts,
      smartAlerts,
      activityRecommendations,
      clothingSuggestions,
      detailedClothingSuggestions,
      daySummary,
      moodInsights,
      movieRecommendations,
      apparentTemperatureExplanation,
      uvIndexAlert,
      healthAndWellnessConditions,
      apparent_temperature: fullWeatherData.apparent_temperature,
      uv_index: fullWeatherData.uv_index,
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

  @Get('history-insights')
  @ApiOperation({ summary: 'Retorna histórico de clima com insights da IA' })
  async getHistoryInsights() {
    const logs = await this.weatherService.findAll();
    
    // Ordenar por timestamp (mais recente primeiro) e pegar últimos 7 dias
    const sortedLogs = logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 7);

    if (sortedLogs.length < 2) {
      return {
        logs: sortedLogs,
        insights: "Dados insuficientes para gerar insights. Continue coletando dados para ver análises mais detalhadas.",
        temperatureTrend: "Dados insuficientes",
      };
    }

    // Calcular tendência de temperatura
    const temperatures = sortedLogs.map(log => log.temperature);
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const firstTemp = temperatures[temperatures.length - 1];
    const lastTemp = temperatures[0];
    const tempChange = lastTemp - firstTemp;

    let trendMessage = "";
    if (tempChange > 2) {
      trendMessage = `A temperatura subiu ${tempChange.toFixed(1)}°C nos últimos ${sortedLogs.length} dias. O clima está ficando mais quente.`;
    } else if (tempChange < -2) {
      trendMessage = `A temperatura caiu ${Math.abs(tempChange).toFixed(1)}°C nos últimos ${sortedLogs.length} dias. O clima está ficando mais frio.`;
    } else {
      trendMessage = `A temperatura está relativamente estável, variando apenas ${Math.abs(tempChange).toFixed(1)}°C nos últimos ${sortedLogs.length} dias.`;
    }

    const insights = `Temperatura média: ${avgTemp.toFixed(1)}°C. ${trendMessage}`;

    return {
      logs: sortedLogs,
      insights,
      temperatureTrend: trendMessage,
      averageTemperature: parseFloat(avgTemp.toFixed(2)),
      temperatureData: sortedLogs.map(log => ({
        date: log.timestamp,
        temperature: log.temperature,
      })),
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
