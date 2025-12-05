import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherController } from '../controllers/weather.controllers';
import { WeatherService } from '../services/weather.service';
import { WeatherLog, WeatherLogSchema } from '../schemas/weather.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WeatherLog.name, schema: WeatherLogSchema }]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService],
})
export class WeatherModule {}
