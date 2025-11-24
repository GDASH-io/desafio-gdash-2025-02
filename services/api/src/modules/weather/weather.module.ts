import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { CreateLogService } from './features/create-log/create-log.service';
import { CreateLogController } from './features/create-log/create-log.controller';
import { FindLogsService } from './features/find-logs/find-logs.service';
import { FindLogsController } from './features/find-logs/find-logs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
  ],
  controllers: [CreateLogController, FindLogsController],
  providers: [CreateLogService, FindLogsService],
  exports: [FindLogsService],
})
export class WeatherModule {}
