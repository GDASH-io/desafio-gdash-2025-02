import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as fs from 'fs';

@ApiTags('weather')
@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post('logs')
  @ApiOperation({ summary: 'Criar registro de clima (usado pelo Go Worker)' })
  create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar registros de clima com paginação' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 50 })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = parseInt(page || '1') || 1;
    const limitNum = parseInt(limit || '50') || 50;
    return this.weatherService.findAll(pageNum, limitNum);
  }

  @Get('logs/latest')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter registros mais recentes' })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  getLatest(@Query('limit') limit?: string) {
    const limitNum = parseInt(limit || '10') || 10;
    return this.weatherService.getLatest(limitNum);
  }

  @Get('logs/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar registro por ID' })
  findOne(@Param('id') id: string) {
    return this.weatherService.findOne(id);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter estatísticas dos dados' })
  getStats() {
    return this.weatherService.getStats();
  }

  @Get('export/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar dados em CSV' })
  async exportCsv(@Res() res: Response) {
    try {
      const filePath = await this.weatherService.exportToCsv();
      
      res.download(filePath, 'weather-data.csv', (err) => {
        if (err) {
          console.error('Erro ao enviar arquivo:', err);
        }
        // Deletar arquivo após download
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao gerar CSV', error: error.message });
    }
  }

  @Get('export/xlsx')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Exportar dados em XLSX' })
  async exportXlsx(@Res() res: Response) {
    try {
      const filePath = await this.weatherService.exportToXlsx();
      
      res.download(filePath, 'weather-data.xlsx', (err) => {
        if (err) {
          console.error('Erro ao enviar arquivo:', err);
        }
        // Deletar arquivo após download
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao gerar XLSX', error: error.message });
    }
  }
}