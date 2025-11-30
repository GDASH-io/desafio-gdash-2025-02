import { GoogleGenAI } from '@google/genai';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { envVariables } from 'src/shared/constants';
import { z } from 'zod';
import { AiAdapterPorts } from '../../ports/ai.adapter.ports';
import { Insight, insightSchema } from '../../schemas/insigthOutputSchema';

@Injectable()
export class GeminiInsightAdapter implements AiAdapterPorts<string, Insight> {
  private readonly logger = new Logger(GeminiInsightAdapter.name);
  private readonly client: GoogleGenAI;
  private readonly model: string;
  private readonly embeddingModel: string;

  constructor(private readonly config: ConfigService) {
    this.client = new GoogleGenAI({
      apiKey: this.config.getOrThrow<string>(
        envVariables.FALLBACK_GEMINI_API_KEY,
      ),
    });
    this.model = this.config.getOrThrow<string>(
      envVariables.FALLBACK_GEMINI_MODEL,
    );
    this.embeddingModel = this.config.getOrThrow<string>(
      envVariables.FALLBACK_GEMINI_EMBEDDING_MODEL,
    );
    this.logger.log('GEMINI Service initialized');
  }

  async callAi(param: string, prompt: string): Promise<Insight | undefined> {
    try {
      this.logger.debug('Calling GEMINI API with weather data (GEMINI)');

      const response = await this.client.models.generateContent({
        model: this.model,
        contents: param,
        config: {
          systemInstruction: prompt,
          responseMimeType: 'application/json',
          responseJsonSchema: z.toJSONSchema(insightSchema),
        },
      });

      const responseText = response.text?.trim();

      if (!responseText) {
        this.logger.error('GEMINI response is empty', responseText);
        return undefined;
      }

      const jsonResponse = JSON.parse(responseText) as Insight;
      if (!jsonResponse) {
        this.logger.error(
          'Error to parse JSON (GEMINI)',
          JSON.stringify(jsonResponse, null, 2),
        );
        return undefined;
      }

      const { success, data, error } = insightSchema.safeParse(jsonResponse);
      if (!success) {
        this.logger.error('Zod validation failed (GEMINI)', error.issues);
        this.logger.error(
          'GEMINI response',
          JSON.stringify(jsonResponse, null, 2),
        );
        return undefined;
      }

      this.logger.log('Successfully generated insight (GEMINI)');
      return data;
    } catch (error) {
      this.logger.error('Error to use GEMINI to generate the Insight', error);
      return undefined;
    }
  }

  async generateEmbedding(input: string): Promise<number[] | undefined> {
    try {
      const result = await this.client.models.embedContent({
        model: this.embeddingModel,
        contents: input,
        config: { outputDimensionality: 10 },
      });

      const embeddingArray = result.embeddings?.flatMap((v) =>
        v.values ? v.values : 0,
      );

      this.logger.log(`Successfully generated embedding (GEMINI)`);
      return embeddingArray;
    } catch (error) {
      this.logger.error('Failed to generate embedding (GEMINI)', error);
      return undefined;
    }
  }
}
