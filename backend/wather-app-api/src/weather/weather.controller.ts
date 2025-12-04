import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { CreateWeatherService } from './services/create-weather.service';
import type { IWeatherEntity } from './interfaces/IWeatherEntity';
import type { Response } from 'express';

@Controller('weather')
export class WeatherController {
    constructor(
        private createWeatherService: CreateWeatherService
    ){}

    @Post('')
    async postWeather(@Body() weather: IWeatherEntity): Promise<IWeatherEntity>{
        return this.createWeatherService.execute(weather);
    }

    @Get('latest')
    async getWeather(){
        return this.createWeatherService.getLatest();
    } 

    @Get('latest/temp')
    async getTemp(){
        return this.createWeatherService.getLatestTemperature();
    }

    @Get('latest/cityName')
    async getName(){
        return this.createWeatherService.getCityName();
    }
    
    @Get('latest/allTemp')
    async getAllTemp(){
        return this.createWeatherService.getAllTemp();
    }

    @Get('insights')
    async getInsights(){
        return this.createWeatherService.generateInsights();
    }

    @Get('/latest/export/xls')
    async getXml(@Res() res: Response){
        const buffer = await this.createWeatherService.exportXLSX();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="weather.xlsx"');

        return res.send(buffer);
    }

    @Get("/latest/export/csv")
    async exportCSV(@Res() res: Response){
        const buffer = await this.createWeatherService.exportCSV();
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=weather.csv");

        res.send(buffer);
    }
}
