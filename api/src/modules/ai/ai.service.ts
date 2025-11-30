import { Inject, Injectable, Logger } from '@nestjs/common';
import { encode } from '@toon-format/toon';
import { ChatCompletionContentPart } from 'openai/resources';
import { commonConstants } from 'src/shared/constants';
import { Saga } from 'src/shared/Saga';
import { WeatherDataItem } from '../weather/infraestructure/schema/weather.schema';
import { AiAdapterPorts } from './ports/ai.adapter.ports';
import { getInsightPrompt } from './prompts/getInsightPrompt';
import { Insight } from './schemas/insigthOutputSchema';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private insightSaga: Saga<Insight | undefined>;
  private embeddingSaga: Saga<number[] | undefined>;
  private readonly systemPrompt = getInsightPrompt();

  constructor(
    @Inject(commonConstants.ports.OPENAI)
    private readonly openAiAdapter: AiAdapterPorts<
      ChatCompletionContentPart[] | string,
      Insight
    >,

    @Inject(commonConstants.ports.GEMINI)
    private readonly geminiAiAdapter: AiAdapterPorts<string, Insight>,
  ) {
    this.insightSaga = new Saga<Insight | undefined>();
    this.embeddingSaga = new Saga<number[] | undefined>();
  }

  async getInsightsFromData(
    data: WeatherDataItem,
  ): Promise<Insight | undefined> {
    const insightsResult = await this.insightSaga.run(async () =>
      this.openAiInsight(data),
    );
    return insightsResult;
  }

  async generateEmbedding(input: string): Promise<number[] | undefined> {
    const embeddingsResult = await this.embeddingSaga.run(async () =>
      this.openAiEmbedding(input),
    );
    return embeddingsResult;
  }

  private async openAiInsight(
    data: WeatherDataItem,
  ): Promise<Insight | undefined> {
    this.insightSaga.addCompensation(async () =>
      this.geminiInsightFallback(data),
    );

    const insigth = await this.openAiAdapter.callAi(
      `Here is the weather data: ${encode(JSON.stringify(data))}`,
      this.systemPrompt,
    );

    this.logger.log('Successfully generated insight');
    return insigth;
  }

  private async geminiInsightFallback(
    data: WeatherDataItem,
  ): Promise<Insight | undefined> {
    this.logger.debug('Failed to generate insight with OpenAI, trying Gemini');
    const fallbackInsight = await this.geminiAiAdapter.callAi(
      `Here is the weather data: ${encode(JSON.stringify(data))}`,
      this.systemPrompt,
    );

    this.logger.log('Generated insight with Gemini as fallback');
    return fallbackInsight || undefined;
  }

  private async openAiEmbedding(input: string): Promise<number[] | undefined> {
    this.embeddingSaga.addCompensation(async () =>
      this.geminiFallbackEmbedding(input),
    );
    const embeddings = await this.openAiAdapter.generateEmbedding(input);
    return embeddings;
  }

  private async geminiFallbackEmbedding(
    input: string,
  ): Promise<number[] | undefined> {
    const embeddings = await this.geminiAiAdapter.generateEmbedding(input);
    return embeddings;
  }
}
