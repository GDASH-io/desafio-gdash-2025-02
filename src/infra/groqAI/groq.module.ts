import { AIRepository } from '@/domain/aplication/AI/AI-repository';
import { Module } from '@nestjs/common';
import { GroqAiReport } from './groq-ai-report';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [EnvModule],
  providers: [{ provide: AIRepository, useClass: GroqAiReport }],
  exports: [AIRepository],
})
export class GroqModule {}
