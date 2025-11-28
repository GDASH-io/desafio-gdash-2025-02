import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiInsightService } from './ai-insight.service';

@Module({
  imports: [ConfigModule],
  providers: [AiInsightService],
  exports: [AiInsightService],
})
export class AiInsightModule {}