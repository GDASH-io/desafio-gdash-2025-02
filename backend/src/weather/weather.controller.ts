import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { UpdateWeatherDto } from './dto/update-weather.dto';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Post()
  create(@Body() createWeatherDto: CreateWeatherDto) {
    return this.weatherService.create(createWeatherDto);
  }

  @Get()
  findAll() {
    return this.weatherService.findAll();
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csvBuffer = await this.weatherService.exportToCsv();
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=weather_data.csv');
    res.send(csvBuffer);
  }

  @Get('export/xlsx')
  async exportXlsx(@Res() res: Response) {
    const xlsxBuffer = await this.weatherService.exportToXlsx();
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', 'attachment; filename=weather_data.xlsx');
    res.send(xlsxBuffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weatherService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeatherDto: UpdateWeatherDto) {
    return this.weatherService.update(+id, updateWeatherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weatherService.remove(+id);
  }
}
