import { Controller, Post, Body, Get, UseGuards, Res, Query } from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherService } from './weather.service';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Controller('weather')
export class WeatherController {
    constructor(private readonly weatherService: WeatherService) {}

    @Post('logs')
    submit(@Body() payload: CreateWeatherLogDto) {
        return this.weatherService.create(payload);
    }

    @Get('cities')
    @UseGuards(JwtAuthGuard)
    async getCities() {
        return { cities: await this.weatherService.findCities() };
    }

    @Get('logs')
    @UseGuards(JwtAuthGuard)
    async findAll(@Query() query: PaginationQueryDto & { city?: string }) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const city = query.city?.trim();
        const result = await this.weatherService.findPaged(page, limit, city || undefined);
        return {
            logs: result.data,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        };
    }

    @Get('export/csv')
    @UseGuards(JwtAuthGuard)
    async exportCsv(@Res({ passthrough: true }) res: Response) {
        const csv = await this.weatherService.exportCsv();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="weather-logs.csv"');
        return res.send(csv);
    }

    @Get('export/xlsx')
    @UseGuards(JwtAuthGuard)
    async exportXlsx(@Res({ passthrough: true }) res: Response) {
        const buffer = await this.weatherService.exportXlsx();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="weather-logs.xlsx"');
        return res.send(buffer);
    }

    @Get('insights')
    @UseGuards(JwtAuthGuard)
    getLatestInsights() {
        return this.weatherService.getLatestAiInsight();
    }

    @Post('insights')
    @UseGuards(JwtAuthGuard)
    insights() {
        return this.weatherService.generateInsights();
    }
}
