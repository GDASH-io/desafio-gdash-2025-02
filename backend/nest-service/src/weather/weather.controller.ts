import { Controller, Get, Post, Body, Res, Req } from '@nestjs/common';
import { ResponseProps, WeatherService } from './weather.service';
import type { Response } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) { }

  @Get()
  async getWeather(@Res() res: Response) {
    const weatherData: ResponseProps = await this.weatherService.getWeather()

    res.status(weatherData.STATUS_CODE).send({ success: weatherData.success, message: weatherData.message })
  }

  @Get("/xlsx")
  async getXLSX(@Res() res: Response) {
    const weatherData = await this.weatherService.getXLSX()
    return res.status(weatherData.STATUS_CODE).send({ success: weatherData.success, message: weatherData.message })
  }


  @Post("/logs")
  async saveWeatherLog(@Body() data: any, @Res() res: Response) {
    const weatherData: ResponseProps = await this.weatherService.saveWeatherData(data)
    return res.status(weatherData.STATUS_CODE).send({ success: weatherData.success, message: weatherData.message })
  }

  @Get("/insights")
  async getInsights(
    @Res() res: Response,
    @Req() req: Request,
  ) {
    const insight = await this.weatherService.getInsight(req["user"]["name"])
    return res.status(insight.STATUS_CODE).send({success: insight.success, message: insight.message});
  }

  // caso sucesso, retorna um array de objetos 
  // dos ultimos sete dias, cada objeto possui
  // a data e as temperaturas registradas 
  // naquele dia.
  @Get("/lastweek/temperatures")
  async getLastWeekTemperatures(
    @Res() res: Response
  ) {
    const data = await this.weatherService.getLastWeekTemperatures()
    res.status(data.STATUS_CODE).send({success: data.success, message: data.message});
  }

  @Get("/lastweek/precxhumid")
  async getLastWeekPrecXHumid(
    @Res() res: Response
  ) {
    const data = await this.weatherService.getLastWeekPrecXHumid();
    res.status(data.STATUS_CODE).send({success: data.success, message: data.message});
  }
}
