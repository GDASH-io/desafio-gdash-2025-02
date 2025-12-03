import api from './api';
import type { Insight } from '@/types';

export const insightsService = {
  async getAll(limit = 20): Promise<Insight[]> {
    const { data } = await api.get<Insight[]>('/insights', {
      params: { limit },
    });
    return data;
  },

  async getLatest(): Promise<Insight[]> {
    const { data } = await api.get<Insight[]>('/insights/latest');
    return data;
  },

  async generate(): Promise<Insight[]> {
    const { data } = await api.post<Insight[]>('/insights/generate');
    return data;
  },
};