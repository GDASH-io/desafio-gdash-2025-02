import { api } from './api';
import type {
  GenerateInsightRequest,
  GenerateInsightResponse,
} from '../types/insights.types';

export const insightsService = {
  async generate(
    request: GenerateInsightRequest
  ): Promise<GenerateInsightResponse> {
    const response = await api.post<GenerateInsightResponse>(
      '/insights/generate',
      request
    );
    return response.data;
  },
};
