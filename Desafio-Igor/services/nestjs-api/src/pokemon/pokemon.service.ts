import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokemonService {
  private readonly baseURL = 'https://pokeapi.co/api/v2';

  async getPokemonList(limit = 20, offset = 0) {
    try {
      const response = await axios.get(`${this.baseURL}/pokemon`, {
        params: { limit, offset },
      });

      const results = await Promise.all(
        response.data.results.map(async (pokemon: any) => {
          const details = await axios.get(pokemon.url);
          return {
            id: details.data.id,
            name: details.data.name,
            image: details.data.sprites.front_default,
            types: details.data.types.map((t: any) => t.type.name),
          };
        }),
      );

      return {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        results,
      };
    } catch (error) {
      throw new HttpException(
        'Failed to fetch Pokemon list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPokemonById(id: number) {
    try {
      const response = await axios.get(`${this.baseURL}/pokemon/${id}`);
      const data = response.data;

      return {
        id: data.id,
        name: data.name,
        height: data.height,
        weight: data.weight,
        types: data.types.map((t: any) => t.type.name),
        abilities: data.abilities.map((a: any) => a.ability.name),
        stats: data.stats.map((s: any) => ({
          name: s.stat.name,
          value: s.base_stat,
        })),
        image: data.sprites.front_default,
        imageShiny: data.sprites.front_shiny,
      };
    } catch (error) {
      throw new HttpException('Pokemon not found', HttpStatus.NOT_FOUND);
    }
  }
}
