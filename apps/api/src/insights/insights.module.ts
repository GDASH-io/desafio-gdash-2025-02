import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

import { WeatherLog, WeatherLogSchema } from '../weather/weather.schema'
import { Insight, InsightSchema } from './insight.schema'
import { InsightsController } from './insights.controller'
import { InsightsService } from './insights.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Insight.name, schema: InsightSchema },
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
  ],
  controllers: [InsightsController],
  providers: [InsightsService],
  exports: [InsightsService],
})
export class InsightsModule {}
