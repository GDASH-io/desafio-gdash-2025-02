import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ExternalApiService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private readonly httpService: HttpService) {}

  async getPokemonList(page: number = 1, limit: number = 20, search?: string) {
    try {
      // Se houver busca, buscar em um range maior de Pokémons
      if (search && search.trim()) {
        const searchLower = search.toLowerCase().trim();
        const allResults: any[] = [];
        
        // Buscar nas primeiras 1000 entradas (PokéAPI tem ~1300 Pokémons)
        const batchSize = 100;
        const maxBatches = 10; // 10 * 100 = 1000 Pokémons
        
        for (let batch = 0; batch < maxBatches; batch++) {
          const offset = batch * batchSize;
          const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/pokemon`, {
              params: { offset, limit: batchSize },
            }),
          );

          const batchResults = await Promise.all(
            response.data.results.map(async (pokemon: any) => {
              const details = await this.getPokemonDetails(pokemon.url);
              return {
                id: details.id,
                name: details.name,
                image: details.sprites.front_default,
                types: details.types.map((t: any) => t.type.name),
                weight: details.weight,
                height: details.height,
              };
            }),
          );

          // Filtrar resultados que correspondem à busca
          const filtered = batchResults.filter(
            (pokemon) =>
              pokemon.name.toLowerCase().includes(searchLower) ||
              pokemon.types.some((type: string) => type.toLowerCase().includes(searchLower)),
          );

          allResults.push(...filtered);

          // Se já temos resultados suficientes, podemos parar
          if (allResults.length >= 200) {
            break;
          }
        }

        // Aplicar paginação após filtro
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = allResults.slice(startIndex, endIndex);

        return {
          data: paginatedResults,
          total: allResults.length,
          page,
          limit,
          totalPages: Math.ceil(allResults.length / limit),
        };
      }

      // Sem busca, comportamento normal com paginação
      const offset = (page - 1) * limit;
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/pokemon`, {
          params: { offset, limit },
        }),
      );

      const results = await Promise.all(
        response.data.results.map(async (pokemon: any) => {
          const details = await this.getPokemonDetails(pokemon.url);
          return {
            id: details.id,
            name: details.name,
            image: details.sprites.front_default,
            types: details.types.map((t: any) => t.type.name),
            weight: details.weight,
            height: details.height,
          };
        }),
      );

      return {
        data: results,
        total: response.data.count,
        page,
        limit,
        totalPages: Math.ceil(response.data.count / limit),
      };
    } catch (error) {
      throw new HttpException('Erro ao buscar lista de Pokémons', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPokemonById(id: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/pokemon/${id}`),
      );
      return {
        id: response.data.id,
        name: response.data.name,
        image: response.data.sprites.front_default,
        types: response.data.types.map((t: any) => t.type.name),
        weight: response.data.weight,
        height: response.data.height,
        abilities: response.data.abilities.map((a: any) => a.ability.name),
        stats: response.data.stats.map((s: any) => ({
          name: s.stat.name,
          value: s.base_stat,
        })),
      };
    } catch (error) {
      throw new HttpException('Pokémon não encontrado', HttpStatus.NOT_FOUND);
    }
  }

  private async getPokemonDetails(url: string) {
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }
}

