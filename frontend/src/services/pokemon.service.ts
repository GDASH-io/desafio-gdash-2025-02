import { api } from './api';

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}

export interface PokemonDetail {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number;
  image: string;
  types: Array<{ slot: number; name: string }>;
  stats: Array<{ name: string; base_stat: number }>;
  abilities: Array<{ name: string; is_hidden: boolean }>;
}

export const pokemonService = {
  async getAll(offset = 0, limit = 20): Promise<PokemonListResponse> {
    const response = await api.get<PokemonListResponse>('/api/pokemon', {
      params: { offset, limit },
    });
    return response.data;
  },

  async getById(id: number): Promise<PokemonDetail> {
    const response = await api.get<PokemonDetail>(`/api/pokemon/${id}`);
    return response.data;
  },
};

