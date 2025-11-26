import { Module } from '@nestjs/common';
import { InsightsIaService } from './insights-ia.service';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherLogsSchema } from 'src/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: 'WeatherLogs',
        schema: WeatherLogsSchema,
      },
    ]),
  ],
  providers: [InsightsIaService],
  exports: [InsightsIaService],
})
export class WeatherModule { }
