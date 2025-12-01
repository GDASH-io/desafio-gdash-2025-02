import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  async getPokemons(limit: number, offset: number) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`,
      );

      const pokemonsWithDetails = await Promise.all(
        response.data.results.map(async (pokemon: any) => {
          const details = await this.getPokemonById(pokemon.name);
          return details;
        }),
      );

      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results: pokemonsWithDetails,
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar pokémons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPokemonById(id: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/pokemon/${id}`);
      const pokemon = response.data;

      return {
        id: pokemon.id,
        name: pokemon.name,
        height: pokemon.height,
        weight: pokemon.weight,
        types: pokemon.types.map((t: any) => t.type.name),
        abilities: pokemon.abilities.map((a: any) => a.ability.name),
        stats: pokemon.stats.map((s: any) => ({
          name: s.stat.name,
          value: s.base_stat,
        })),
        sprites: {
          front_default: pokemon.sprites.front_default,
          front_shiny: pokemon.sprites.front_shiny,
          official_artwork:
            pokemon.sprites.other['official-artwork'].front_default,
        },
      };
    } catch (error) {
      throw new HttpException('Pokémon não encontrado', HttpStatus.NOT_FOUND);
    }
  }

  async searchPokemon(name: string) {
    try {
      return await this.getPokemonById(name.toLowerCase());
    } catch (error) {
      throw new HttpException('Pokémon não encontrado', HttpStatus.NOT_FOUND);
    }
  }
}
