import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLog, WeatherLogSchema } from './schemas/weather-log.schema';
import { CreateLogService } from './features/create-log/create-log.service';
import { CreateLogController } from './features/create-log/create-log.controller';
import { FindLogsService } from './features/find-logs/find-logs.service';
import { FindLogsController } from './features/find-logs/find-logs.controller';
import { ExportLogsService } from './features/export-logs/export-logs.service';
import { ExportLogsController } from './features/export-logs/export-logs.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
  ],
  controllers: [CreateLogController, FindLogsController, ExportLogsController],
  providers: [CreateLogService, FindLogsService, ExportLogsService],
  exports: [FindLogsService],
})
export class WeatherModule {}
