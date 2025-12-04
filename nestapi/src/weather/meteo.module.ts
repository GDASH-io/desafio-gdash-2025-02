import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherService } from './meteo.service';
import { WeatherLog, WeatherLogSchema } from './schemas/meteo-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
  ],
  providers: [WeatherService],
  exports: [WeatherService],
})
export class WeatherModule {}
