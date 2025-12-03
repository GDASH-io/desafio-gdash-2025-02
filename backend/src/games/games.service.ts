import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { LoggerService } from '../common/logger/logger.service';
import { getConfig } from '../config/configuration';

@Injectable()
export class GamesService {
  private readonly baseUrl = 'https://api.rawg.io/api';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly logger: LoggerService,
  ) {
    const config = getConfig();
    this.apiKey = config.RAWG_KEY || '';
    
    if (!this.apiKey) {
      this.logger.warn('RAWG_KEY not configured. Games API may not work properly.', {
        service: 'backend',
        module: 'games',
      });
    }
  }

  /**
   * Busca plataformas disponíveis na API RAWG
   * Mapeia IDs para PS5, Xbox, Switch, PC
   */
  private getPlatformIds(): Record<string, number> {
    // IDs das plataformas mais comuns na RAWG API
    // PS5: 187, Xbox Series X/S: 186, Nintendo Switch: 7, PC: 4
    return {
      'PS5': 187,
      'Xbox': 186, // Xbox Series X/S
      'Switch': 7,
      'PC': 4,
    };
  }

  /**
   * Lista jogos com paginação e filtros
   */
  async getGames(
    page: number = 1,
    pageSize: number = 20,
    platformId?: number,
    search?: string,
  ) {
    this.logger.log('Fetching games list', {
      service: 'backend',
      module: 'games',
      operation: 'getGames',
      page,
      pageSize,
      platformId,
      search,
    });

    if (!this.apiKey) {
      throw new HttpException(
        'RAWG API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      const params: any = {
        key: this.apiKey,
        page,
        page_size: pageSize,
        ordering: '-added', // Mais recentes primeiro
      };

      if (platformId) {
        params.platforms = platformId;
      }

      if (search && search.trim()) {
        params.search = search.trim();
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/games`, { params }),
      );

      const results = response.data.results || [];
      const total = response.data.count || 0;
      const totalPages = Math.ceil(total / pageSize);

      return {
        data: results.map((game: any) => ({
          id: game.id,
          name: game.name,
          image: game.background_image,
          platforms: game.platforms?.map((p: any) => p.platform.name) || [],
          genres: game.genres?.map((g: any) => g.name) || [],
          rating: game.rating,
          ratingTop: game.rating_top,
          ratingsCount: game.ratings_count,
          released: game.released,
          developers: game.developers?.map((d: any) => d.name) || [],
          screenshots: [], // Será preenchido na tela de detalhes
        })),
        page,
        limit: pageSize,
        total,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      };
    } catch (error: any) {
      this.logger.error('Error fetching games list', error.message, {
        service: 'backend',
        module: 'games',
        operation: 'getGames',
        error: error.message,
      });

      if (error?.response?.status === 429) {
        throw new HttpException(
          'Muitas requisições. Por favor, aguarde um momento antes de tentar novamente.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        'Erro ao buscar jogos',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Busca detalhes completos de um jogo
   */
  async getGameById(id: number) {
    this.logger.log('Fetching game details', {
      service: 'backend',
      module: 'games',
      operation: 'getGameById',
      id,
    });

    if (!this.apiKey) {
      throw new HttpException(
        'RAWG API key not configured',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }

    try {
      // Buscar detalhes do jogo
      const gameResponse = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/games/${id}`, {
          params: { key: this.apiKey },
        }),
      );

      const game = gameResponse.data;

      // Buscar screenshots do jogo
      let screenshots: string[] = [];
      try {
        const screenshotsResponse = await firstValueFrom(
          this.httpService.get(`${this.baseUrl}/games/${id}/screenshots`, {
            params: { key: this.apiKey },
          }),
        );
        screenshots =
          screenshotsResponse.data.results?.map((s: any) => s.image) || [];
      } catch (err) {
        this.logger.warn('Failed to fetch screenshots', {
          service: 'backend',
          module: 'games',
          operation: 'getGameById',
          id,
        });
      }

      return {
        id: game.id,
        name: game.name,
        image: game.background_image,
        description: game.description_raw || game.description || '',
        platforms: game.platforms?.map((p: any) => ({
          name: p.platform.name,
          releasedAt: p.released_at,
        })) || [],
        genres: game.genres?.map((g: any) => g.name) || [],
        rating: game.rating,
        ratingTop: game.rating_top,
        ratingsCount: game.ratings_count,
        released: game.released,
        developers: game.developers?.map((d: any) => d.name) || [],
        publishers: game.publishers?.map((p: any) => p.name) || [],
        screenshots,
        metacritic: game.metacritic,
        website: game.website,
        esrbRating: game.esrb_rating?.name,
      };
    } catch (error: any) {
      this.logger.error('Error fetching game details', error.message, {
        service: 'backend',
        module: 'games',
        operation: 'getGameById',
        id,
        error: error.message,
      });

      if (error?.response?.status === 404) {
        throw new HttpException('Jogo não encontrado', HttpStatus.NOT_FOUND);
      }

      if (error?.response?.status === 429) {
        throw new HttpException(
          'Muitas requisições. Por favor, aguarde um momento antes de tentar novamente.',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      throw new HttpException(
        'Erro ao buscar detalhes do jogo',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retorna lista de plataformas disponíveis para filtro
   */
  getAvailablePlatforms() {
    return Object.entries(this.getPlatformIds()).map(([name, id]) => ({
      id,
      name,
    }));
  }
}

