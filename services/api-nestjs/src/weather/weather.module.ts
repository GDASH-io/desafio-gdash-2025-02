import { Module } from '@nestjs/common';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLogsSchema } from 'src/schema/user.schema';
import { CsvExportService } from 'src/exports/csv/csv-export.service';
import { XlsxExportService } from 'src/exports/xlsx/xlsx-export.service';
import { InsightsIaService } from 'src/insights-ia/insights-ia.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'WeatherLogs',
        schema: WeatherLogsSchema,
      },
    ]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, CsvExportService, XlsxExportService, InsightsIaService],
})
export class WeatherModule { }
