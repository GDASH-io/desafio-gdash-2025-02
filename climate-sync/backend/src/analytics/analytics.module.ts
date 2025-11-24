import { Module } from '@nestjs/common';
import { AnalyticsController } from '../analytics/analytics.controller';
import { AnalyticsService } from '../analytics/analytics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Weather, WeatherSchema } from '../weather/schema/weather.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Weather.name, schema: WeatherSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
