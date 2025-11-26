import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { WeatherService } from "./weather.service";
import { CreateWeatherLogDto } from "./dto/create-weather-log.dto";

@ApiTags("Weather Logs")
@Controller("weather")
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post("logs")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Recebe dados meteorológicos do Worker Go" })
  @ApiResponse({
    status: 201,
    description: "Dados recebidos com sucesso",
  })
  @ApiResponse({
    status: 400,
    description: "Dados inválidos",
  })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.createWeatherLog(createWeatherLogDto);
  }
}
