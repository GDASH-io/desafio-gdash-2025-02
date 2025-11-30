import { Test, TestingModule } from '@nestjs/testing';
import { commonConstants } from 'src/shared/constants';
import { WeatherDataItem } from '../../weather/infraestructure/schema/weather.schema';
import { AiService } from '../ai.service';
import { InMemoryAiAdapter } from '../infraestructure/adapters/inMemoryAi.adapter';
import { Insight } from '../schemas/insigthOutputSchema';

// Mock @toon-format/toon globally
jest.mock('@toon-format/toon', () => ({
  encode: jest.fn((data) => `encoded-${data}`),
}));

describe('AiService', () => {
  let service: AiService;
  let openAiAdapter: InMemoryAiAdapter;
  let geminiAdapter: InMemoryAiAdapter;

  const mockWeatherData: WeatherDataItem = {
    date: '2025-11-28',
    hour: '10:00',
    interval: { value: 900, unit: 'seconds' },
    temperature_2m: { value: 25.5, unit: '°C' },
    relative_humidity_2m: { value: 65, unit: '%' },
    precipitation_probability: { value: 10, unit: '%' },
    precipitation: { value: 0, unit: 'mm' },
    rain: { value: 0, unit: 'mm' },
    weather_code: { value: 0, unit: 'wmo code' },
    pressure_msl: { value: 1013.5, unit: 'hPa' },
    cloud_cover: { value: 20, unit: '%' },
    visibility: { value: 10000, unit: 'm' },
    evapotranspiration: { value: 0.5, unit: 'mm' },
    et0_fao_evapotranspiration: { value: 0.6, unit: 'mm' },
    wind_speed_10m: { value: 15.2, unit: 'km/h' },
    wind_speed_80m: { value: 20.5, unit: 'km/h' },
    wind_speed_120m: { value: 22.3, unit: 'km/h' },
    wind_direction_10m: { value: 180, unit: '°' },
    wind_direction_80m: { value: 185, unit: '°' },
    wind_direction_120m: { value: 190, unit: '°' },
    wind_speed_180m: { value: 25.1, unit: 'km/h' },
    wind_direction_180m: { value: 195, unit: '°' },
    wind_gusts_10m: { value: 30.5, unit: 'km/h' },
    temperature_80m: { value: 24.2, unit: '°C' },
    temperature_120m: { value: 23.8, unit: '°C' },
    temperature_180m: { value: 23.5, unit: '°C' },
    is_day: { value: 1, unit: '' },
    uv_index: { value: 5, unit: '' },
    uv_index_clear_sky: { value: 6, unit: '' },
    direct_radiation: { value: 500, unit: 'W/m²' },
  };

  const mockInsight: Insight = {
    description: 'Pleasant weather with moderate temperatures and light winds.',
    activities: ['Walking', 'Cycling', 'Outdoor picnic'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: commonConstants.ports.OPENAI,
          useClass: InMemoryAiAdapter,
        },
        {
          provide: commonConstants.ports.GEMINI,
          useClass: InMemoryAiAdapter,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    openAiAdapter = module.get<InMemoryAiAdapter>(commonConstants.ports.OPENAI);
    geminiAdapter = module.get<InMemoryAiAdapter>(commonConstants.ports.GEMINI);

    // Reset adapters before each test
    openAiAdapter.reset();
    geminiAdapter.reset();
  });

  describe('getInsightsFromData', () => {
    it('should call OpenAI adapter and return insights', async () => {
      openAiAdapter.setMockInsight(mockInsight);

      const result = await service.getInsightsFromData(mockWeatherData);

      expect(openAiAdapter.getCallAiCallCount()).toBe(1);
      expect(result).toEqual(mockInsight);
      expect(result?.description).toBe(mockInsight.description);
      expect(result?.activities).toEqual(mockInsight.activities);
    });

    it('should include encoded weather data in the call', async () => {
      openAiAdapter.setMockInsight(mockInsight);

      await service.getInsightsFromData(mockWeatherData);

      const lastParams = openAiAdapter.getLastCallAiParams();
      expect(lastParams?.param).toContain('Here is the weather data:');
      expect(lastParams?.param).toContain('encoded-');
    });

    it('should fallback to Gemini when OpenAI fails', async () => {
      const geminiInsight: Insight = {
        description: 'Gemini generated insight',
        activities: ['Indoor activities'],
      };

      openAiAdapter.setShouldFailCallAi(true);
      geminiAdapter.setMockInsight(geminiInsight);

      const result = await service.getInsightsFromData(mockWeatherData);

      expect(openAiAdapter.getCallAiCallCount()).toBe(1);
      expect(geminiAdapter.getCallAiCallCount()).toBe(1);
      expect(result).toEqual(geminiInsight);
    });

    it('should pass system prompt to OpenAI adapter', async () => {
      openAiAdapter.setMockInsight(mockInsight);

      await service.getInsightsFromData(mockWeatherData);

      const lastParams = openAiAdapter.getLastCallAiParams();
      expect(lastParams?.prompt).toBeDefined();
      expect(typeof lastParams?.prompt).toBe('string');
    });

    it('should handle undefined result from OpenAI', async () => {
      openAiAdapter.setMockInsight(undefined);

      const result = await service.getInsightsFromData(mockWeatherData);

      expect(result).toBeUndefined();
    });

    it('should use same weather data for Gemini fallback', async () => {
      const geminiInsight: Insight = {
        description: 'Fallback insight',
        activities: ['Stay indoors'],
      };

      openAiAdapter.setShouldFailCallAi(true);
      geminiAdapter.setMockInsight(geminiInsight);

      await service.getInsightsFromData(mockWeatherData);

      const geminiParams = geminiAdapter.getLastCallAiParams();
      expect(geminiParams?.param).toContain('Here is the weather data:');
      expect(geminiParams?.param).toContain('encoded-');
    });

    it('should return undefined when both adapters fail', async () => {
      openAiAdapter.setShouldFailCallAi(true);
      geminiAdapter.setShouldFailCallAi(true);

      const result = await service.getInsightsFromData(mockWeatherData);

      expect(result).toBeUndefined();
      expect(openAiAdapter.getCallAiCallCount()).toBe(1);
      expect(geminiAdapter.getCallAiCallCount()).toBe(1);
    });
  });

  describe('generateEmbedding', () => {
    const mockEmbedding = [0.1, 0.2, 0.3, 0.4, 0.5];
    const inputText = 'Sample text for embedding generation';

    it('should call OpenAI adapter and return embeddings', async () => {
      openAiAdapter.setMockEmbedding(mockEmbedding);

      const result = await service.generateEmbedding(inputText);

      expect(openAiAdapter.getGenerateEmbeddingCallCount()).toBe(1);
      expect(openAiAdapter.getLastEmbeddingInput()).toBe(inputText);
      expect(result).toEqual(mockEmbedding);
      expect(result).toHaveLength(5);
    });

    it('should pass correct input text to OpenAI adapter', async () => {
      openAiAdapter.setMockEmbedding(mockEmbedding);

      await service.generateEmbedding(inputText);

      expect(openAiAdapter.getLastEmbeddingInput()).toBe(inputText);
    });

    it('should fallback to Gemini when OpenAI fails', async () => {
      const geminiEmbedding = [0.9, 0.8, 0.7, 0.6, 0.5];

      openAiAdapter.setShouldFailEmbedding(true);
      geminiAdapter.setMockEmbedding(geminiEmbedding);

      const result = await service.generateEmbedding(inputText);

      expect(openAiAdapter.getGenerateEmbeddingCallCount()).toBe(1);
      expect(geminiAdapter.getGenerateEmbeddingCallCount()).toBe(1);
      expect(result).toEqual(geminiEmbedding);
    });

    it('should pass same input to Gemini fallback', async () => {
      const geminiEmbedding = [0.5, 0.4, 0.3, 0.2, 0.1];

      openAiAdapter.setShouldFailEmbedding(true);
      geminiAdapter.setMockEmbedding(geminiEmbedding);

      await service.generateEmbedding(inputText);

      expect(geminiAdapter.getLastEmbeddingInput()).toBe(inputText);
    });

    it('should handle undefined result from OpenAI', async () => {
      openAiAdapter.setMockEmbedding(undefined);

      const result = await service.generateEmbedding(inputText);

      expect(result).toBeUndefined();
    });

    it('should handle empty string input', async () => {
      openAiAdapter.setMockEmbedding([]);

      const result = await service.generateEmbedding('');

      expect(openAiAdapter.getLastEmbeddingInput()).toBe('');
      expect(result).toEqual([]);
    });

    it('should return undefined when both adapters fail', async () => {
      openAiAdapter.setShouldFailEmbedding(true);
      geminiAdapter.setShouldFailEmbedding(true);

      const result = await service.generateEmbedding(inputText);

      expect(result).toBeUndefined();
      expect(openAiAdapter.getGenerateEmbeddingCallCount()).toBe(1);
      expect(geminiAdapter.getGenerateEmbeddingCallCount()).toBe(1);
    });

    it('should handle long text input', async () => {
      const longText = 'A'.repeat(1000);
      openAiAdapter.setMockEmbedding(mockEmbedding);

      const result = await service.generateEmbedding(longText);

      expect(openAiAdapter.getLastEmbeddingInput()).toBe(longText);
      expect(result).toEqual(mockEmbedding);
    });

    it('should return array of numbers', async () => {
      openAiAdapter.setMockEmbedding(mockEmbedding);

      const result = await service.generateEmbedding(inputText);

      expect(Array.isArray(result)).toBe(true);
      result?.forEach((value) => {
        expect(typeof value).toBe('number');
      });
    });
  });

  describe('SAGA pattern integration', () => {
    it('should handle sequential operations with SAGA', async () => {
      const embedding = [0.1, 0.2, 0.3];
      openAiAdapter.setMockInsight(mockInsight);
      openAiAdapter.setMockEmbedding(embedding);

      const insightResult = await service.getInsightsFromData(mockWeatherData);
      const embeddingResult = await service.generateEmbedding('test');

      expect(insightResult).toEqual(mockInsight);
      expect(embeddingResult).toEqual(embedding);
    });

    it('should handle multiple insight requests', async () => {
      const insight1: Insight = {
        description: 'First insight',
        activities: ['Activity 1'],
      };

      openAiAdapter.setMockInsight(insight1);

      const result1 = await service.getInsightsFromData(mockWeatherData);

      const insight2: Insight = {
        description: 'Second insight',
        activities: ['Activity 2'],
      };

      openAiAdapter.setMockInsight(insight2);
      const result2 = await service.getInsightsFromData(mockWeatherData);

      expect(result1).toEqual(insight1);
      expect(result2).toEqual(insight2);
      expect(openAiAdapter.getCallAiCallCount()).toBe(2);
    });

    it('should handle multiple embedding requests', async () => {
      const embedding1 = [0.1, 0.2];
      openAiAdapter.setMockEmbedding(embedding1);

      const result1 = await service.generateEmbedding('text1');

      const embedding2 = [0.3, 0.4];
      openAiAdapter.setMockEmbedding(embedding2);

      const result2 = await service.generateEmbedding('text2');

      expect(result1).toEqual(embedding1);
      expect(result2).toEqual(embedding2);
      expect(openAiAdapter.getGenerateEmbeddingCallCount()).toBe(2);
    });

    it('should handle mixed success and failure scenarios', async () => {
      const geminiInsight: Insight = {
        description: 'Gemini insight',
        activities: ['Fallback activity'],
      };
      const embedding = [0.5, 0.6, 0.7];

      // First insight fails, second succeeds
      openAiAdapter.setShouldFailCallAi(true);
      geminiAdapter.setMockInsight(geminiInsight);
      openAiAdapter.setMockEmbedding(embedding);

      const insightResult = await service.getInsightsFromData(mockWeatherData);
      const embeddingResult = await service.generateEmbedding('test');

      expect(insightResult).toEqual(geminiInsight);
      expect(embeddingResult).toEqual(embedding);
    });
  });

  describe('error handling', () => {
    it('should handle network errors gracefully', async () => {
      openAiAdapter.setShouldFailCallAi(true);
      geminiAdapter.setShouldFailCallAi(true);

      const result = await service.getInsightsFromData(mockWeatherData);

      expect(result).toBeUndefined();
    });

    it('should handle timeout errors', async () => {
      openAiAdapter.setShouldFailEmbedding(true);
      geminiAdapter.setShouldFailEmbedding(true);

      const result = await service.generateEmbedding('test');

      expect(result).toBeUndefined();
    });

    it('should handle invalid response format from OpenAI', async () => {
      openAiAdapter.setMockInsight(undefined);

      const result = await service.getInsightsFromData(mockWeatherData);

      expect(result).toBeUndefined();
    });

    it('should handle empty array embeddings', async () => {
      openAiAdapter.setMockEmbedding([]);

      const result = await service.generateEmbedding('test');

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
