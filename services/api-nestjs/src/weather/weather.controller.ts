import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Delete,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { logsWeatherDTO } from '../DTO/logsWeather.dto';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @ApiOperation({ summary: 'Criar novo log de clima' })
  @ApiResponse({ status: 201, description: 'Log criado com sucesso' })
  async logWeatherData(@Body() logsWeather: logsWeatherDTO) {
    return await this.weatherService.logWeatherPost(logsWeather);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Buscar todos os logs de clima' })
  @ApiResponse({ status: 200, description: 'Lista de logs retornada' })
  async getAllLogs() {
    return await this.weatherService.logWeatherGet();
  }

  @Get('logs/:id')
  @ApiOperation({ summary: 'Buscar log de clima por ID' })
  @ApiParam({ name: 'id', description: 'ID do log' })
  @ApiResponse({ status: 200, description: 'Log encontrado' })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  async getLogById(@Param('id') id: string) {
    const log = await this.weatherService.logWeatherGetById(id);
    if (!log) {
      throw new HttpException('Log não encontrado', HttpStatus.NOT_FOUND);
    }
    return log;
  }

  @Put('logs/:id')
  @ApiOperation({ summary: 'Atualizar log de clima' })
  @ApiParam({ name: 'id', description: 'ID do log' })
  @ApiResponse({ status: 200, description: 'Log atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  async updateLog(
    @Param('id') id: string,
    @Body() updateData: Partial<logsWeatherDTO>,
  ) {
    const updatedLog = await this.weatherService.updateLogWeather(
      id,
      updateData,
    );
    if (!updatedLog) {
      throw new HttpException('Log não encontrado', HttpStatus.NOT_FOUND);
    }
    return updatedLog;
  }

  @Delete('logs/:id')
  @ApiOperation({ summary: 'Deletar log de clima' })
  @ApiParam({ name: 'id', description: 'ID do log' })
  @ApiResponse({ status: 200, description: 'Log deletado com sucesso' })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  async deleteLog(@Param('id') id: string) {
    const deletedLog = await this.weatherService.deleteLogWeather(id);
    if (!deletedLog) {
      throw new HttpException('Log não encontrado', HttpStatus.NOT_FOUND);
    }
    return { message: 'Log deletado com sucesso', data: deletedLog };
  }
}
