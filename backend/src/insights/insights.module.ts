import { Module } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';

@Module({
  providers: [InsightsService],
  controllers: [InsightsController]
})
export class InsightsModule {}
