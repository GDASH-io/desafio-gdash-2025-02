import { Controller, Post, Body, Get, Res, UseGuards } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('weather')
export class WeatherController {
  constructor(private weatherService: WeatherService) {}

  @Public()  
  @Post()
  async create(@Body() body: any) {
    return this.weatherService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.weatherService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('export/csv')
  async exportCsv(@Res() res: any) {
    const stream = await this.weatherService.exportCSV();
    res.setHeader("Content-Disposition", "attachment; filename=data.csv");
    stream.pipe(res);
  }

  @UseGuards(JwtAuthGuard)
  @Get('export/xlsx')
  async exportExcel(@Res() res: any) {
    const buffer = await this.weatherService.exportXLSX();
    res.setHeader("Content-Disposition", "attachment; filename=data.xlsx");
    res.send(buffer);
  }
}
