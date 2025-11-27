import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private readonly httpService: HttpService) {}

  async getPokemonList(limit: number = 20, offset: number = 0, includeAlternativeForms: boolean = false) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/pokemon?limit=${limit}&offset=${offset}`)
      );
      
      let count = response.data.count;
      
      if (!includeAlternativeForms) {
        // Filtrar apenas Pokémon com ID < 10000 para a contagem (excluindo formas alternativas)
        const allPokemonResponse = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/pokemon?limit=2000&offset=0`)
        );
        
        count = allPokemonResponse.data.results.filter((pokemon: any) => {
          const id = parseInt(pokemon.url.split('/').slice(-2, -1)[0]);
          return id < 10000;
        }).length;
      }

      return {
        ...response.data,
        count
      };
    } catch (error) {
      throw new HttpException('Failed to fetch Pokemon list', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPokemonDetails(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/pokemon/${id}`)
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new HttpException('Pokemon not found', HttpStatus.NOT_FOUND);
      }
      throw new HttpException('Failed to fetch Pokemon details', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPokemonTypes() {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/type`)
      );
      return response.data;
    } catch (error) {
      throw new HttpException('Failed to fetch Pokemon types', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async searchPokemon(name?: string, type?: string, limit: number = 20, offset: number = 0, includeAlternativeForms: boolean = false) {
    try {
      if (name) {
        // Search by name (direct API call)
        try {
          const response = await firstValueFrom(
            this.httpService.get(`${this.baseUrl}/pokemon/${name.toLowerCase()}`)
          );
          return {
            results: [{
              name: response.data.name,
              url: `${this.baseUrl}/pokemon/${response.data.id}/`
            }],
            count: 1
          };
        } catch (error) {
          return { results: [], count: 0 };
        }
      }

      if (type) {
        // Search by type with pagination
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/type/${type}`)
        );
        
        const allPokemon = response.data.pokemon.map((p: any) => ({
          name: p.pokemon.name,
          url: p.pokemon.url
        }));

        let basePokemon = allPokemon;
        
        if (!includeAlternativeForms) {
          // Filtrar apenas Pokémon com ID < 10000 (excluindo formas alternativas)
          basePokemon = allPokemon.filter((pokemon: any) => {
            const id = parseInt(pokemon.url.split('/').slice(-2, -1)[0]);
            return id < 10000;
          });
        }

        // Apply pagination
        const totalCount = basePokemon.length;
        const paginatedPokemon = basePokemon.slice(offset, offset + limit);

        return {
          results: paginatedPokemon,
          count: totalCount,
          next: offset + limit < totalCount ? `?limit=${limit}&offset=${offset + limit}` : null,
          previous: offset > 0 ? `?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null
        };
      }

      return { results: [], count: 0 };
    } catch (error) {
      throw new HttpException('Search failed', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}