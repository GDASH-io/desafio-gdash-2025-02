import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { GroqService } from './groq.service';

@Module({
  imports: [ConfigModule, HttpModule],
  providers: [AiService, GroqService],
  controllers: [AiController],
  exports: [AiService, GroqService],
})
export class AiModule {}
