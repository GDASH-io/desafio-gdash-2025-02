import api from "@/lib/api";

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: { name: string; value: number }[];
  sprites: {
    front_default: string;
    front_shiny: string;
    official_artwork: string;
  };
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}

class PokemonService {
  async getPokemons(limit = 20, offset = 0): Promise<PokemonListResponse> {
    const response = await api.get(`/pokemon`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async getPokemonById(id: string): Promise<Pokemon> {
    const response = await api.get(`/pokemon/${id}`);
    return response.data;
  }

  async searchPokemon(name: string): Promise<Pokemon> {
    const response = await api.get(`/pokemon/search/${name}`);
    return response.data;
  }
}

export default new PokemonService();
