import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

const BASE_URL = 'https://pokeapi.co/api/v2'; // PokéAPI usa limit/offset para paginação [web:25][web:30]

@Injectable()
export class PokemonService {
  constructor(private http: HttpService) {}

  async list(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { data } = await firstValueFrom(
      this.http.get(`${BASE_URL}/pokemon`, {
        params: { limit, offset },
      }),
    );

    // data.count, data.next, data.previous, data.results[] [web:25][web:30]
    const results = data.results.map((item: any) => {
      const id = item.url.split('/').filter(Boolean).pop();
      return {
        id,
        name: item.name,
        image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      };
    });

    const total = data.count as number;
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      results,
    };
  }

  async detail(idOrName: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${BASE_URL}/pokemon/${idOrName}`),
    );

    return {
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      types: data.types.map((t: any) => t.type.name),
      image: data.sprites.other['official-artwork'].front_default,
      stats: data.stats.map((s: any) => ({
        name: s.stat.name,
        base: s.base_stat,
      })),
    };
  }
}
