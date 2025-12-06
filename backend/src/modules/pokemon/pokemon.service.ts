import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  async findAll(offset: number = 0, limit: number = 20) {
    try {
      const response = await axios.get(`${this.baseUrl}/pokemon`, {
        params: { offset, limit },
      });

      const results = await Promise.all(
        response.data.results.map(async (pokemon: any) => {
          const details = await this.findOneByUrl(pokemon.url);
          return {
            id: details.id,
            name: details.name,
            image: details.sprites.front_default,
            types: details.types.map((t: any) => t.type.name),
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
        'Erro ao buscar Pokémons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number) {
    try {
      const response = await axios.get(`${this.baseUrl}/pokemon/${id}`);
      return {
        id: response.data.id,
        name: response.data.name,
        height: response.data.height,
        weight: response.data.weight,
        base_experience: response.data.base_experience,
        image: response.data.sprites.front_default,
        types: response.data.types.map((t: any) => ({
          slot: t.slot,
          name: t.type.name,
        })),
        stats: response.data.stats.map((s: any) => ({
          name: s.stat.name,
          base_stat: s.base_stat,
        })),
        abilities: response.data.abilities.map((a: any) => ({
          name: a.ability.name,
          is_hidden: a.is_hidden,
        })),
      };
    } catch (error) {
      throw new HttpException('Pokémon não encontrado', HttpStatus.NOT_FOUND);
    }
  }

  private async findOneByUrl(url: string) {
    const response = await axios.get(url);
    return response.data;
  }
}
