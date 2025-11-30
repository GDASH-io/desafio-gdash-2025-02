import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { commonConstants } from 'src/shared/constants';
import { AiService } from './ai.service';
import { GeminiInsightAdapter } from './infraestructure/adapters/geminiAi.adapters';
import { OpenAiInsightAdapter } from './infraestructure/adapters/openAi.adapters';

@Module({
  providers: [
    AiService,
    {
      provide: commonConstants.ports.OPENAI,
      useFactory: (config: ConfigService) => {
        return new OpenAiInsightAdapter(config);
      },
      inject: [ConfigService],
    },
    {
      provide: commonConstants.ports.GEMINI,
      useFactory: (config: ConfigService) => {
        return new GeminiInsightAdapter(config);
      },
      inject: [ConfigService],
    },
  ],
  exports: [AiService],
})
export class AiModule {}
