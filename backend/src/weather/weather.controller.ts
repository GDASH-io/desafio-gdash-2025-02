import { Controller, Get, Post, Body, Res } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { Response } from 'express';

@Controller('api/weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) { }

    @Post('logs')
    async create(@Body() createWeatherLogDto: any) {
        return this.weatherService.create(createWeatherLogDto);
    }

    @Get('logs')
    async findAll() {
        return this.weatherService.findAll();
    }

    @Get('export.csv')
    async exportCsv(@Res() res: Response) {
        const csv = await this.weatherService.getCsv();
        res.header('Content-Type', 'text/csv');
        res.attachment('weather_logs.csv');
        res.send(csv);
    }

    @Get('export.xlsx')
    async exportXlsx(@Res() res: Response) {
        const buffer = await this.weatherService.getXlsx();
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('weather_logs.xlsx');
        res.send(buffer);
    }
}
