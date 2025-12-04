import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface Pokemon {
  name: string;
  url: string;
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
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: Array<{
    slot: number;
    type: {
      name: string;
      url: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
      url: string;
    };
    is_hidden: boolean;
  }>;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
}

@Injectable()
export class PokemonService {
  private readonly logger = new Logger(PokemonService.name);
  private readonly baseURL = 'https://pokeapi.co/api/v2';

  async getPokemons(limit: number = 20, offset: number = 0): Promise<any> {
    try {
      this.logger.log(`Buscando ${limit} Pokémons (offset: ${offset})`);

      const response = await axios.get<PokemonListResponse>(`${this.baseURL}/pokemon`, {
        params: { limit, offset },
      });

      const { count, next, previous, results } = response.data;

      // Calcular informações de paginação
      const totalPages = Math.ceil(count / limit);
      const currentPage = Math.floor(offset / limit) + 1;

      return {
        total: count,
        limit,
        offset,
        currentPage,
        totalPages,
        next: next ? true : false,
        previous: previous ? true : false,
        pokemons: results.map((pokemon: Pokemon, index: number) => ({
          id: offset + index + 1,
          name: pokemon.name,
          url: pokemon.url,
        })),
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar Pokémons: ${error.message}`);
      throw error;
    }
  }

  async getPokemonDetail(idOrName: string): Promise<PokemonDetail> {
    try {
      this.logger.log(`Buscando detalhes do Pokémon: ${idOrName}`);

      const response = await axios.get<PokemonDetail>(`${this.baseURL}/pokemon/${idOrName}`);

      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar Pokémon ${idOrName}: ${error.message}`);
      throw error;
    }
  }

  async searchPokemon(query: string): Promise<any> {
    try {
      // PokéAPI não tem busca por nome parcial, então tentamos buscar diretamente
      const pokemon = await this.getPokemonDetail(query.toLowerCase());
      return {
        found: true,
        pokemon,
      };
    } catch (error) {
      return {
        found: false,
        message: 'Pokémon não encontrado',
      };
    }
  }
}
