import { Controller, Get, Post, Delete, Body, Res, HttpStatus, Query, ParseFloatPipe, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherLog } from './schemas/weather-log.schema';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AiService, FullWeatherData } from '../ai/ai.service';
import { CityCoordinatesService } from './city-coordinates.service';
import { TmdbService } from '../tmdb/tmdb.service';

@ApiTags('Clima')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly aiService: AiService,
    private readonly cityCoordinatesService: CityCoordinatesService,
    private readonly tmdbService: TmdbService,
  ) {}

  @Get('forecast')
  @ApiOperation({ summary: 'Obter previsão do tempo por cidade ou coordenadas' })
  @ApiQuery({ name: 'city', type: String, required: false, description: 'Nome da cidade' })
  @ApiQuery({ name: 'latitude', type: Number, required: false, description: 'Latitude (se não fornecer cidade)' })
  @ApiQuery({ name: 'longitude', type: Number, required: false, description: 'Longitude (se não fornecer cidade)' })
  async getWeatherForecast(
    @Query('city') city?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
  ) {
    let lat: number;
    let lon: number;

    if (city) {
      const coordinates = this.cityCoordinatesService.getCoordinates(city);
      if (!coordinates) {
        throw new BadRequestException(`Cidade "${city}" não encontrada. Use /weather/cities para ver cidades disponíveis.`);
      }
      lat = coordinates.latitude;
      lon = coordinates.longitude;
    } else if (latitude !== undefined && longitude !== undefined) {
      lat = latitude;
      lon = longitude;
    } else {
      throw new BadRequestException('Forneça "city" ou "latitude" e "longitude"');
    }

    return this.weatherService.getWeatherForecast(lat, lon);
  }

  @Get('ai-insights')
  @ApiOperation({ summary: 'Obter insights de IA sobre o clima por cidade ou coordenadas' })
  @ApiQuery({ name: 'city', type: String, required: false, description: 'Nome da cidade' })
  @ApiQuery({ name: 'latitude', type: Number, required: false, description: 'Latitude (se não fornecer cidade)' })
  @ApiQuery({ name: 'longitude', type: Number, required: false, description: 'Longitude (se não fornecer cidade)' })
  async getAiInsights(
    @Query('city') city?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
  ) {
    let lat: number;
    let lon: number;
    let cityName: string = 'a localização';

    if (city) {
      const coordinates = this.cityCoordinatesService.getCoordinates(city);
      if (!coordinates) {
        throw new BadRequestException(`Cidade "${city}" não encontrada. Use /weather/cities para ver cidades disponíveis.`);
      }
      lat = coordinates.latitude;
      lon = coordinates.longitude;
      cityName = coordinates.name;
    } else if (latitude !== undefined && longitude !== undefined) {
      lat = latitude;
      lon = longitude;
      const allCities = this.cityCoordinatesService.getAllCities();
      const foundCity = allCities.find(c => 
        Math.abs(c.latitude - lat) < 0.1 && Math.abs(c.longitude - lon) < 0.1
      );
      if (foundCity) {
        cityName = foundCity.name;
      }
    } else {
      throw new BadRequestException('Forneça "city" ou "latitude" e "longitude"');
    }

    const weatherForecast = await this.weatherService.getWeatherForecast(lat, lon);

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
    }, cityName);
    const healthAlerts = this.aiService.generateHealthAlerts(fullWeatherData);
    const smartAlerts = await this.aiService.generateSmartAlerts(fullWeatherData, cityName);
    const activityRecommendations = await this.aiService.getActivityRecommendations(fullWeatherData, cityName);
    const clothingSuggestions = this.aiService.getClothingSuggestions(fullWeatherData);
    const detailedClothingSuggestions = this.aiService.getDetailedClothingSuggestions(fullWeatherData);
    const daySummary = await this.aiService.getDaySummary(fullWeatherData, cityName);
    const moodInsights = await this.aiService.getMoodInsights(fullWeatherData, cityName);
    const movieCriteria = await this.aiService.getMovieRecommendationsByWeather(fullWeatherData, cityName);
    const apparentTemperatureExplanation = this.aiService.getApparentTemperatureExplanation(fullWeatherData);
    const uvIndexAlert = fullWeatherData.uv_index ? this.aiService.getUvIndexAlert(fullWeatherData.uv_index) : null;
    const healthAndWellnessConditions = await this.aiService.getHealthAndWellnessConditions(fullWeatherData, cityName);

    const response = {
      weatherForecast,
      explainedWeather: typeof explainedWeather === 'string' ? explainedWeather : String(explainedWeather),
      healthAlerts: Array.isArray(healthAlerts) ? healthAlerts : [],
      smartAlerts: Array.isArray(smartAlerts) ? smartAlerts : [],
      activityRecommendations: Array.isArray(activityRecommendations) ? activityRecommendations : [],
      clothingSuggestions: typeof clothingSuggestions === 'string' ? clothingSuggestions : String(clothingSuggestions),
      detailedClothingSuggestions: Array.isArray(detailedClothingSuggestions) ? detailedClothingSuggestions : [],
      daySummary: typeof daySummary === 'string' ? daySummary.trim() : String(daySummary).trim(),
      moodInsights: typeof moodInsights === 'string' ? moodInsights.trim() : String(moodInsights).trim(),
      movieCriteria: movieCriteria || {},
      apparentTemperatureExplanation: typeof apparentTemperatureExplanation === 'string' ? apparentTemperatureExplanation : String(apparentTemperatureExplanation),
      uvIndexAlert: uvIndexAlert || null,
      healthAndWellnessConditions: Array.isArray(healthAndWellnessConditions) ? healthAndWellnessConditions : [],
      apparent_temperature: fullWeatherData.apparent_temperature,
      uv_index: fullWeatherData.uv_index,
    };

    return response;
  }

  @Get('movies-by-criteria')
  @ApiOperation({ summary: 'Buscar filmes no TMDB usando critérios gerados pela IA' })
  @ApiQuery({ name: 'city', type: String, required: false, description: 'Nome da cidade' })
  @ApiQuery({ name: 'latitude', type: Number, required: false, description: 'Latitude (se não fornecer cidade)' })
  @ApiQuery({ name: 'longitude', type: Number, required: false, description: 'Longitude (se não fornecer cidade)' })
  @ApiQuery({ name: 'page', type: Number, required: false, description: 'Página de resultados (padrão: 1)' })
  async getMoviesByCriteria(
    @Query('city') city?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('page') page: number = 1,
  ) {
    let lat: number;
    let lon: number;
    let cityName: string | undefined = city;

    if (city) {
      const coordinates = this.cityCoordinatesService.getCoordinates(city);
      if (!coordinates) {
        throw new BadRequestException(`Cidade "${city}" não encontrada. Use /weather/cities para ver cidades disponíveis.`);
      }
      lat = coordinates.latitude;
      lon = coordinates.longitude;
      cityName = coordinates.name;
    } else if (latitude !== undefined && longitude !== undefined) {
      lat = latitude;
      lon = longitude;
      const foundCity = this.cityCoordinatesService.getCityByCoordinates(latitude, longitude);
      cityName = foundCity ? foundCity.name : undefined;
    } else {
      lat = -12.9714;
      lon = -38.5014;
      cityName = 'Salvador';
    }

    const weatherForecast = await this.weatherService.getWeatherForecast(lat, lon);

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

    try {
      const movieCriteria = await this.aiService.getMovieRecommendationsByWeather(fullWeatherData, cityName);

      if (!movieCriteria || typeof movieCriteria !== 'object') {
        console.warn('⚠️ [Weather] Critérios de filmes inválidos, usando padrão');
        throw new Error('Critérios de filmes inválidos');
      }

      if (!Array.isArray(movieCriteria.generos_sugeridos)) {
        console.warn('⚠️ [Weather] generos_sugeridos não é um array, convertendo...');
        movieCriteria.generos_sugeridos = [];
      }

      console.log('✅ [Weather] Critérios de filmes gerados:', JSON.stringify(movieCriteria, null, 2));

      const movies = await this.tmdbService.getMoviesByCriteria(movieCriteria, page);

      return {
        criteria: movieCriteria,
        movies: movies?.results || [],
        total_pages: movies?.total_pages || 1,
        total_results: movies?.total_results || 0,
      };
    } catch (error: any) {
      console.error('❌ [Weather] Erro ao buscar filmes por critérios:', error?.message || error);
      
      return {
        criteria: {
          generos_sugeridos: [],
          tema: 'variado',
          description: 'Não foi possível gerar critérios personalizados',
        },
        movies: [],
        total_pages: 1,
        total_results: 0,
        error: error?.message || 'Erro ao buscar filmes',
      };
    }
  }

  @Post('logs')
  @ApiOperation({ summary: 'Cria um novo registro de log de clima' })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Retorna todos os registros de log de clima' })
  @ApiQuery({ name: 'city', type: String, required: false, description: 'Filtrar por cidade' })
  async findAll(@Query('city') city?: string): Promise<WeatherLog[]> {
    return this.weatherService.findAll(city);
  }

  @Post('logs/update')
  @ApiOperation({ summary: 'Busca dados atuais da API e cria um novo log para a cidade especificada' })
  @ApiQuery({ name: 'city', type: String, required: true, description: 'Nome da cidade' })
  async updateLogs(@Query('city') city: string) {
    if (!city) {
      throw new BadRequestException('Cidade é obrigatória');
    }

    try {
      const log = await this.weatherService.createLogFromApi(city, this.cityCoordinatesService);
      return {
        message: `Log criado com sucesso para ${city}`,
        log,
        count: 1,
      };
    } catch (error: any) {
      console.error('❌ [Weather] Erro no controller updateLogs:', error);
      throw new InternalServerErrorException(
        error?.message || 'Erro ao atualizar logs',
        error
      );
    }
  }

  @Delete('logs')
  @ApiOperation({ summary: 'Remove todos os logs de uma cidade específica' })
  @ApiQuery({ name: 'city', type: String, required: true, description: 'Nome da cidade' })
  async clearLogs(@Query('city') city: string) {
    if (!city) {
      throw new BadRequestException('Cidade é obrigatória');
    }
    const result = await this.weatherService.deleteByCity(city);
    return {
      message: `${result.deletedCount} log(s) removido(s) para ${city}`,
      deletedCount: result.deletedCount,
    };
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
  @ApiQuery({ name: 'city', type: String, required: false, description: 'Nome da cidade' })
  @ApiQuery({ name: 'latitude', type: Number, required: false, description: 'Latitude (se não fornecer cidade)' })
  @ApiQuery({ name: 'longitude', type: Number, required: false, description: 'Longitude (se não fornecer cidade)' })
  @ApiQuery({ name: 'days', type: Number, required: false, description: 'Número de dias (padrão: 7)' })
  async getHistoryInsights(
    @Query('city') city?: string,
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('days') days?: number,
  ) {
    let lat: number;
    let lon: number;

    if (city) {
      const coordinates = this.cityCoordinatesService.getCoordinates(city);
      if (!coordinates) {
        throw new BadRequestException(`Cidade "${city}" não encontrada. Use /weather/cities para ver cidades disponíveis.`);
      }
      lat = coordinates.latitude;
      lon = coordinates.longitude;
    } else if (latitude !== undefined && longitude !== undefined) {
      lat = latitude;
      lon = longitude;
    } else {
      lat = -12.9714;
      lon = -38.5014;
    }

    const daysCount = days ?? 7;

    try {
      const historyData = await this.weatherService.getWeatherHistory(lat, lon, daysCount);

      if (!historyData || !historyData.daily || !historyData.daily.time || historyData.daily.time.length === 0) {
        return {
          logs: [],
          insights: "Dados insuficientes para gerar insights. Não foi possível obter dados históricos da API.",
          temperatureTrend: "Dados insuficientes",
          averageTemperature: 0,
          temperatureData: [],
        };
      }

      const { time, temperature_2m_max, temperature_2m_min } = historyData.daily;
      
      const dailyData = time.map((date: string, index: number) => {
        const max = temperature_2m_max[index];
        const min = temperature_2m_min[index];
        const avg = (max + min) / 2;
        
        return {
          date,
          averageTemperature: avg,
          maxTemperature: max,
          minTemperature: min,
        };
      }).reverse();

      if (dailyData.length < 2) {
        const day = dailyData[0];
        const variation = day.maxTemperature - day.minTemperature;
        const trendMessage = variation > 2 
          ? `A temperatura variou ${variation.toFixed(1)}°C durante o dia.`
          : `A temperatura está relativamente estável, variando apenas ${variation.toFixed(1)}°C durante o dia.`;
        
        const insights = `Temperatura média: ${day.averageTemperature.toFixed(1)}°C. ${trendMessage}`;
        
        return {
          logs: [{
            _id: `day-${day.date}`,
            timestamp: `${day.date}T12:00:00.000Z`,
            temperature: day.averageTemperature,
          }],
          insights,
          temperatureTrend: trendMessage,
          averageTemperature: parseFloat(day.averageTemperature.toFixed(2)),
          temperatureData: [{
            date: `${day.date}T12:00:00.000Z`,
            temperature: day.averageTemperature,
          }],
        };
      }

      const temperatures = dailyData.map(day => day.averageTemperature);
      const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
      const firstTemp = temperatures[temperatures.length - 1];
      const lastTemp = temperatures[0];
      const tempChange = lastTemp - firstTemp;

      let trendMessage = "";
      if (tempChange > 2) {
        trendMessage = `A temperatura subiu ${tempChange.toFixed(1)}°C nos últimos ${dailyData.length} dias. O clima está ficando mais quente.`;
      } else if (tempChange < -2) {
        trendMessage = `A temperatura caiu ${Math.abs(tempChange).toFixed(1)}°C nos últimos ${dailyData.length} dias. O clima está ficando mais frio.`;
      } else {
        trendMessage = `A temperatura está relativamente estável, variando apenas ${Math.abs(tempChange).toFixed(1)}°C nos últimos ${dailyData.length} dias.`;
      }

      const insights = `Temperatura média: ${avgTemp.toFixed(1)}°C. ${trendMessage}`;

      const representativeLogs = dailyData.map(day => ({
        _id: `day-${day.date}`,
        timestamp: `${day.date}T12:00:00.000Z`,
        temperature: day.averageTemperature,
      }));

      return {
        logs: representativeLogs,
        insights,
        temperatureTrend: trendMessage,
        averageTemperature: parseFloat(avgTemp.toFixed(2)),
        temperatureData: dailyData.map(day => ({
          date: `${day.date}T12:00:00.000Z`,
          temperature: day.averageTemperature,
        })),
      };
    } catch (error) {
      console.error('[history-insights] Erro ao buscar dados históricos:', error);
      return {
        logs: [],
        insights: "Erro ao buscar dados históricos da API. Tente novamente mais tarde.",
        temperatureTrend: "Erro ao buscar dados",
        averageTemperature: 0,
        temperatureData: [],
      };
    }
  }

  @Get('cities')
  @ApiOperation({ summary: 'Lista todas as cidades disponíveis ou busca cidades' })
  @ApiQuery({ name: 'search', type: String, required: false, description: 'Buscar cidades por nome' })
  async getCities(@Query('search') search?: string) {
    if (search) {
      return this.cityCoordinatesService.searchCities(search);
    }
    return this.cityCoordinatesService.getAllCities();
  }

  @Get('export.csv')
  @ApiOperation({ summary: 'Exporta registros de clima para CSV' })
  @ApiQuery({ name: 'city', type: String, required: false, description: 'Filtrar por cidade' })
  async exportCsv(@Res() res: Response, @Query('city') city?: string) {
    try {
      const csv = await this.weatherService.exportCsv(city);
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
  @ApiQuery({ name: 'city', type: String, required: false, description: 'Filtrar por cidade' })
  async exportXlsx(@Res() res: Response, @Query('city') city?: string) {
    try {
      const buffer = await this.weatherService.exportXlsx(city);
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('weather_logs.xlsx');
      return res.send(buffer);
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Erro ao exportar dados XLSX.');
    }
  }
}
