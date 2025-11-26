import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import type { Response } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) { }

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
    const dados = await this.weatherService.findAll();

    let csv = 'Data,Temperatura,Umidade,Vento,Chuva\n';

    dados.forEach((d) => {
      const data = new Date(d.createdAt).toISOString();
      csv += `${data},${d.temperatura},${d.umidade},${d.velocidade_vento},${d.chuva}\n`;
    });

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', 'attachment; filename=historico_clima.csv');
    return res.send(csv);
  }
}
