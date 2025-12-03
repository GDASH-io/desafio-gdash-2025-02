import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {}

  async getPokemonList(page: number = 1, limit: number = 20, search?: string) {
    const offset = (page - 1) * limit;
    
    this.logger.log('Fetching Pokemon list', {
      service: 'backend',
      module: 'pokemon',
      operation: 'getPokemonList',
      page,
      limit,
      offset,
      search,
    });

    try {
      // Se há busca, percorrer todas as páginas e filtrar
      if (search && search.trim()) {
        const searchTerm = search.trim().toLowerCase();
        const allMatchingPokemon: any[] = [];
        let currentPage = 1;
        const maxPages = 20; // Reduzir limite para evitar rate limit
        const pageSize = 50; // Reduzir tamanho da página
        const delayBetweenRequests = 200; // Delay de 200ms entre requisições
        
        // Buscar todas as páginas até encontrar todos os resultados ou atingir o limite
        while (currentPage <= maxPages) {
          try {
            const response = await firstValueFrom(
              this.httpService.get(`${this.baseUrl}/pokemon`, {
                params: { offset: (currentPage - 1) * pageSize, limit: pageSize },
              }),
            );
            
            const results = response.data.results || [];
            
            // Filtrar pokemon que correspondem ao termo de busca
            const matching = results.filter((pokemon: any) =>
              pokemon.name.toLowerCase().includes(searchTerm)
            );
            
            // Buscar detalhes dos pokemon que correspondem com delay
            for (const pokemon of matching) {
              try {
                await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
                const detailResponse = await firstValueFrom(
                  this.httpService.get(pokemon.url),
                );
                allMatchingPokemon.push({
                  id: detailResponse.data.id,
                  name: detailResponse.data.name,
                  image: detailResponse.data.sprites.front_default,
                  types: detailResponse.data.types.map((t: any) => t.type.name),
                  height: detailResponse.data.height,
                  weight: detailResponse.data.weight,
                  url: pokemon.url,
                });
              } catch (err: any) {
                // Se for erro 429, parar a busca
                if (err?.response?.status === 429) {
                  this.logger.warn('Rate limit atingido durante busca de Pokemon', {
                    service: 'backend',
                    module: 'pokemon',
                    operation: 'getPokemonList',
                  });
                  break;
                }
              }
            }
            
            // Se não há mais resultados ou já encontramos o suficiente, parar
            if (results.length < pageSize) {
              break;
            }
            
            // Delay entre páginas
            await new Promise(resolve => setTimeout(resolve, delayBetweenRequests));
            currentPage++;
          } catch (err: any) {
            // Se for erro 429, retornar o que já foi encontrado
            if (err?.response?.status === 429) {
              this.logger.warn('Rate limit atingido durante busca de Pokemon', {
                service: 'backend',
                module: 'pokemon',
                operation: 'getPokemonList',
              });
              break;
            }
            throw err;
          }
        }
        
        const total = allMatchingPokemon.length;
        const totalPages = Math.ceil(total / limit);
        
        // Aplicar paginação
        const paginatedResults = allMatchingPokemon.slice(offset, offset + limit);
        
        return {
          data: paginatedResults,
          page,
          limit,
          total,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        };
      }
      
      // Busca normal sem filtro
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/pokemon`, {
          params: { offset, limit },
        }),
      );

      const results = response.data.results;
      const total = response.data.count;
      const totalPages = Math.ceil(total / limit);

      // Buscar detalhes de cada pokemon
      const pokemonDetails = await Promise.all(
        results.map(async (pokemon: any) => {
          const detailResponse = await firstValueFrom(
            this.httpService.get(pokemon.url),
          );
          return {
            id: detailResponse.data.id,
            name: detailResponse.data.name,
            image: detailResponse.data.sprites.front_default,
            types: detailResponse.data.types.map((t: any) => t.type.name),
            height: detailResponse.data.height,
            weight: detailResponse.data.weight,
            url: pokemon.url,
          };
        }),
      );

      return {
        data: pokemonDetails,
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      };
    } catch (error: any) {
      this.logger.error('Error fetching Pokemon list', error.message, {
        service: 'backend',
        module: 'pokemon',
        operation: 'getPokemonList',
        error: error.message,
      });
      
      // Tratamento específico para rate limit
      if (error?.response?.status === 429) {
        throw new HttpException(
          'Muitas requisições. Por favor, aguarde um momento antes de tentar novamente.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
      
      throw new HttpException(
        'Failed to fetch Pokemon list',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPokemonById(id: number) {
    this.logger.log('Fetching Pokemon details', {
      service: 'backend',
      module: 'pokemon',
      operation: 'getPokemonById',
      id,
    });

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/pokemon/${id}`),
      );

      return {
        id: response.data.id,
        name: response.data.name,
        image: response.data.sprites.front_default,
        types: response.data.types.map((t: any) => t.type.name),
        height: response.data.height,
        weight: response.data.weight,
        abilities: response.data.abilities.map((a: any) => a.ability.name),
        stats: response.data.stats.map((s: any) => ({
          name: s.stat.name,
          value: s.base_stat,
        })),
        moves: response.data.moves.slice(0, 10).map((m: any) => m.move.name),
      };
    } catch (error) {
      this.logger.error('Error fetching Pokemon details', error.message, {
        service: 'backend',
        module: 'pokemon',
        operation: 'getPokemonById',
        id,
        error: error.message,
      });
      throw new HttpException(
        'Failed to fetch Pokemon details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

