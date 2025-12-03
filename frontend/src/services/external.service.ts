import type { Pokemon, StarWarsCharacter } from '@/types';

// Nota: Essas APIs são chamadas diretamente (não passam pelo backend)
// Se quiser passar pelo backend, ajuste para api.get('/external-api/...')

export const externalService = {
  // ==========================================
  // POKÉMON API
  // ==========================================
  async getPokemonList(offset = 0, limit = 20) {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`
    );
    const data = await response.json();
    return {
      results: data.results,
      count: data.count,
    };
  },

  async getPokemonDetails(nameOrId: string | number): Promise<Pokemon> {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
    return response.json();
  },

  // ==========================================
  // STAR WARS API
  // ==========================================
  async getStarWarsCharacters(page = 1) {
    const response = await fetch(`https://swapi.dev/api/people/?page=${page}`);
    const data = await response.json();
    return {
      results: data.results as StarWarsCharacter[],
      count: data.count,
    };
  },

  async getStarWarsCharacterDetails(id: number): Promise<StarWarsCharacter> {
    const response = await fetch(`https://swapi.dev/api/people/${id}/`);
    return response.json();
  },

  async getStarWarsPlanet(url: string) {
    const response = await fetch(url);
    return response.json();
  },
};