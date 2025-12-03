import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../common/logger/logger.service';

@Injectable()
export class StarWarsService {
  private readonly baseUrl = 'https://swapi.dev/api';

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {}

  async getPeople(page: number = 1, limit: number = 10, search?: string) {
    const offset = (page - 1) * limit;
    
    this.logger.log('Fetching Star Wars people', {
      service: 'backend',
      module: 'starwars',
      operation: 'getPeople',
      page,
      limit,
      search,
    });

    try {
      // Se há busca, usar o parâmetro search da SWAPI
      if (search && search.trim()) {
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/people`, {
            params: { search: search.trim() },
          }),
        );
        
        const allResults = response.data.results || [];
        const total = response.data.count || 0;
        
        // Aplicar paginação nos resultados da busca
        const paginatedResults = allResults.slice(offset, offset + limit);
        const totalPages = Math.ceil(total / limit);
        
        return {
          data: paginatedResults.map((person: any) => ({
            name: person.name,
            height: person.height,
            mass: person.mass,
            hair_color: person.hair_color,
            skin_color: person.skin_color,
            eye_color: person.eye_color,
            birth_year: person.birth_year,
            gender: person.gender,
            url: person.url,
          })),
          page,
          limit,
          total,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        };
      }
      
      // A API do Star Wars retorna 10 itens por página
      // Precisamos calcular quais páginas buscar
      const swapiPageStart = Math.floor(offset / 10) + 1;
      const swapiPageEnd = Math.floor((offset + limit - 1) / 10) + 1;
      const startIndexInPage = offset % 10;
      
      const allResults: any[] = [];
      let total: number | null = null;
      
      // Buscar todas as páginas necessárias
      for (let swapiPage = swapiPageStart; swapiPage <= swapiPageEnd; swapiPage++) {
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/people`, {
            params: { page: swapiPage },
          }),
        );
        
        // Salvar o count da primeira página buscada (geralmente será a página 1)
        if (total === null) {
          total = response.data.count;
        }
        
        if (swapiPage === swapiPageStart && swapiPage === swapiPageEnd) {
          // Mesma página, fazer slice
          allResults.push(...response.data.results.slice(startIndexInPage, startIndexInPage + limit));
        } else if (swapiPage === swapiPageStart) {
          // Primeira página, pegar do índice até o fim
          allResults.push(...response.data.results.slice(startIndexInPage));
        } else if (swapiPage === swapiPageEnd) {
          // Última página, pegar do início até o índice necessário
          const endIndex = (offset + limit) % 10 || 10;
          allResults.push(...response.data.results.slice(0, endIndex));
        } else {
          // Páginas intermediárias, pegar tudo
          allResults.push(...response.data.results);
        }
      }

      // Pegar apenas os itens necessários (limitar ao limit)
      const results = allResults.slice(0, limit);
      
      // Se não temos o total ainda (caso raro), buscar a página 1
      if (total === null) {
        const firstResponse = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/people`, {
            params: { page: 1 },
          }),
        );
        total = firstResponse.data.count;
      }
      
      const totalPages = Math.ceil(total / limit);

      return {
        data: results.map((person: any) => ({
          name: person.name,
          height: person.height,
          mass: person.mass,
          hair_color: person.hair_color,
          skin_color: person.skin_color,
          eye_color: person.eye_color,
          birth_year: person.birth_year,
          gender: person.gender,
          url: person.url,
        })),
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      };
    } catch (error: any) {
      this.logger.error('Error fetching Star Wars people', error.message, {
        service: 'backend',
        module: 'starwars',
        operation: 'getPeople',
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
        'Erro ao buscar pessoas de Star Wars',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPlanets(page: number = 1, limit: number = 10, search?: string) {
    this.logger.log('Fetching Star Wars planets', {
      service: 'backend',
      module: 'starwars',
      operation: 'getPlanets',
      page,
      limit,
      search,
    });

    try {
      // Se há busca, usar o parâmetro search da SWAPI
      if (search && search.trim()) {
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/planets`, {
            params: { search: search.trim() },
          }),
        );
        
        const allResults = response.data.results || [];
        const total = response.data.count || 0;
        const offset = (page - 1) * limit;
        
        // Aplicar paginação nos resultados da busca
        const paginatedResults = allResults.slice(offset, offset + limit);
        const totalPages = Math.ceil(total / limit);
        
        return {
          data: paginatedResults.map((planet: any) => ({
            name: planet.name,
            rotation_period: planet.rotation_period,
            orbital_period: planet.orbital_period,
            diameter: planet.diameter,
            climate: planet.climate,
            gravity: planet.gravity,
            terrain: planet.terrain,
            surface_water: planet.surface_water,
            population: planet.population,
            url: planet.url,
          })),
          page,
          limit,
          total,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        };
      }
      
      const offset = (page - 1) * limit;
      const swapiPageStart = Math.floor(offset / 10) + 1;
      const swapiPageEnd = Math.floor((offset + limit - 1) / 10) + 1;
      const startIndexInPage = offset % 10;
      
      const allResults: any[] = [];
      let total: number | null = null;
      
      for (let swapiPage = swapiPageStart; swapiPage <= swapiPageEnd; swapiPage++) {
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/planets`, {
            params: { page: swapiPage },
          }),
        );
        
        if (total === null) {
          total = response.data.count;
        }
        
        if (swapiPage === swapiPageStart && swapiPage === swapiPageEnd) {
          allResults.push(...response.data.results.slice(startIndexInPage, startIndexInPage + limit));
        } else if (swapiPage === swapiPageStart) {
          allResults.push(...response.data.results.slice(startIndexInPage));
        } else if (swapiPage === swapiPageEnd) {
          const endIndex = (offset + limit) % 10 || 10;
          allResults.push(...response.data.results.slice(0, endIndex));
        } else {
          allResults.push(...response.data.results);
        }
      }

      const results = allResults.slice(0, limit);
      
      if (total === null) {
        const firstResponse = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/planets`, {
            params: { page: 1 },
          }),
        );
        total = firstResponse.data.count;
      }
      
      const totalPages = Math.ceil(total / limit);

      return {
        data: results.map((planet: any) => ({
          name: planet.name,
          rotation_period: planet.rotation_period,
          orbital_period: planet.orbital_period,
          diameter: planet.diameter,
          climate: planet.climate,
          gravity: planet.gravity,
          terrain: planet.terrain,
          surface_water: planet.surface_water,
          population: planet.population,
          url: planet.url,
        })),
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      };
    } catch (error: any) {
      this.logger.error('Error fetching Star Wars planets', error.message, {
        service: 'backend',
        module: 'starwars',
        operation: 'getPlanets',
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
        'Erro ao buscar planetas de Star Wars',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getStarships(page: number = 1, limit: number = 10, search?: string) {
    this.logger.log('Fetching Star Wars starships', {
      service: 'backend',
      module: 'starwars',
      operation: 'getStarships',
      page,
      limit,
      search,
    });

    try {
      // Se há busca, usar o parâmetro search da SWAPI
      if (search && search.trim()) {
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/starships`, {
            params: { search: search.trim() },
          }),
        );
        
        const allResults = response.data.results || [];
        const total = response.data.count || 0;
        const offset = (page - 1) * limit;
        
        // Aplicar paginação nos resultados da busca
        const paginatedResults = allResults.slice(offset, offset + limit);
        const totalPages = Math.ceil(total / limit);
        
        return {
          data: paginatedResults.map((starship: any) => ({
            name: starship.name,
            model: starship.model,
            manufacturer: starship.manufacturer,
            cost_in_credits: starship.cost_in_credits,
            length: starship.length,
            max_atmosphering_speed: starship.max_atmosphering_speed,
            crew: starship.crew,
            passengers: starship.passengers,
            cargo_capacity: starship.cargo_capacity,
            starship_class: starship.starship_class,
            url: starship.url,
          })),
          page,
          limit,
          total,
          totalPages,
          hasPreviousPage: page > 1,
          hasNextPage: page < totalPages,
        };
      }
      
      const offset = (page - 1) * limit;
      const swapiPageStart = Math.floor(offset / 10) + 1;
      const swapiPageEnd = Math.floor((offset + limit - 1) / 10) + 1;
      const startIndexInPage = offset % 10;
      
      const allResults: any[] = [];
      let total: number | null = null;
      
      for (let swapiPage = swapiPageStart; swapiPage <= swapiPageEnd; swapiPage++) {
        const response = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/starships`, {
            params: { page: swapiPage },
          }),
        );
        
        if (total === null) {
          total = response.data.count;
        }
        
        if (swapiPage === swapiPageStart && swapiPage === swapiPageEnd) {
          allResults.push(...response.data.results.slice(startIndexInPage, startIndexInPage + limit));
        } else if (swapiPage === swapiPageStart) {
          allResults.push(...response.data.results.slice(startIndexInPage));
        } else if (swapiPage === swapiPageEnd) {
          const endIndex = (offset + limit) % 10 || 10;
          allResults.push(...response.data.results.slice(0, endIndex));
        } else {
          allResults.push(...response.data.results);
        }
      }

      const results = allResults.slice(0, limit);
      
      if (total === null) {
        const firstResponse = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/starships`, {
            params: { page: 1 },
          }),
        );
        total = firstResponse.data.count;
      }
      
      const totalPages = Math.ceil(total / limit);

      return {
        data: results.map((starship: any) => ({
          name: starship.name,
          model: starship.model,
          manufacturer: starship.manufacturer,
          cost_in_credits: starship.cost_in_credits,
          length: starship.length,
          max_atmosphering_speed: starship.max_atmosphering_speed,
          crew: starship.crew,
          passengers: starship.passengers,
          cargo_capacity: starship.cargo_capacity,
          starship_class: starship.starship_class,
          url: starship.url,
        })),
        page,
        limit,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      };
    } catch (error: any) {
      this.logger.error('Error fetching Star Wars starships', error.message, {
        service: 'backend',
        module: 'starwars',
        operation: 'getStarships',
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
        'Erro ao buscar naves de Star Wars',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

