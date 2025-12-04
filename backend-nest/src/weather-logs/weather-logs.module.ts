import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLogsController } from './weather-logs.controller';
import { WeatherLogsService } from './weather-logs.service';
import { WeatherLog, WeatherLogSchema } from './weather-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema }
    ])
  ],
  controllers: [WeatherLogsController],
  providers: [WeatherLogsService],
  exports: [WeatherLogsService]
})
export class WeatherLogsModule {}
