import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { ChatCompletionContentPart } from 'openai/resources';
import { envVariables } from 'src/shared/constants';
import { AiAdapterPorts } from '../../ports/ai.adapter.ports';
import { Insight, insightSchema } from '../../schemas/insigthOutputSchema';

@Injectable()
export class OpenAiInsightAdapter
  implements AiAdapterPorts<ChatCompletionContentPart[] | string, Insight>
{
  private readonly logger = new Logger(OpenAiInsightAdapter.name);
  private readonly client: OpenAI;
  private readonly model: string;
  private readonly embeddingModel: string;

  constructor(private readonly config: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.config.getOrThrow<string>(envVariables.OPENAI_API_KEY),
    });
    this.model = this.config.getOrThrow<string>(envVariables.OPENAI_MODEL);
    this.embeddingModel = this.config.getOrThrow<string>(
      envVariables.OPENAI_EBEDDING_MODEL,
    );
    this.logger.log('OPENAI Service initialized');
  }

  async callAi(
    param: ChatCompletionContentPart[] | string,
    prompt: string,
  ): Promise<Insight | undefined> {
    try {
      this.logger.debug('Calling OpenAI API with weather data (OPENAI)');

      const aiResponse = await this.client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: typeof param === 'string' ? param : JSON.stringify(param),
          },
        ],
        response_format: zodResponseFormat(insightSchema, 'insight'),
      });

      const jsonResponse = aiResponse.choices[0].message.content;

      if (!jsonResponse) {
        this.logger.error(
          'OpenAI response is empty',
          JSON.stringify(aiResponse, null, 2),
        );
        throw new Error('Failed processing insight');
      }

      const { success, data, error } = insightSchema.safeParse(
        JSON.parse(jsonResponse),
      );

      if (!success) {
        this.logger.error('Zod validation failed (OPENAI)', error.issues);
        this.logger.error(
          'OpenAI response',
          JSON.stringify(jsonResponse, null, 2),
        );
        throw new Error('Failed processing insight');
      }

      this.logger.log('Successfully generated insight (OPENAI)');
      return data;
    } catch (error) {
      this.logger.error(JSON.stringify(error));
      throw new Error('Failed processing insight');
    }
  }

  async generateEmbedding(input: string): Promise<number[] | undefined> {
    try {
      const response = await this.client.embeddings.create({
        model: 'text-embedding-3-small',
        input: input,
        encoding_format: 'float',
      });

      if (!response.data || response.data.length === 0) {
        this.logger.error('No embeddings returned from OpenAI');
        throw new Error('Failed generating embedding');
      }

      this.logger.log(`Successfully generated embedding (OPENAI)`);
      return response.data[0].embedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding (OPENAI)', error);
      throw new Error('Failed generating embedding');
    }
  }
}
