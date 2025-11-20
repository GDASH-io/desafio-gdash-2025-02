import { Module } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { WeatherRepository } from './repositories/weather.repository';
import { PrismaWeatherRepository } from './repositories/prisma-weather.repository';

@Module({
  imports: [PrismaModule],
  controllers: [WeatherController],
  providers: [
    WeatherService,
    {
      provide: WeatherRepository,      
      useClass: PrismaWeatherRepository,
    },
  ],
})
export class WeatherModule {}