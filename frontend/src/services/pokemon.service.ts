import api from './api';

export interface Pokemon {
  id: number;
  name: string;
  image: string;
  types: string[];
  weight: number;
  height: number;
  abilities?: string[];
  stats?: { name: string; value: number }[];
}

export interface PokemonListResponse {
  data: Pokemon[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const pokemonService = {
  getList: async (page: number = 1, limit: number = 20, search?: string): Promise<PokemonListResponse> => {
    const response = await api.get<PokemonListResponse>('/external/pokemon', {
      params: { page, limit, ...(search && { search }) },
    });
    return response.data;
  },
  getById: async (id: number): Promise<Pokemon> => {
    const response = await api.get<Pokemon>(`/external/pokemon/${id}`);
    return response.data;
  },
};

