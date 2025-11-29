import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import { Observable, of } from 'rxjs';
import { firstValueFrom } from 'rxjs';

interface CacheEntry {
  data: any;
  timestamp: number;
}

@Injectable()
export class TmdbService {
  private readonly TMDB_API_KEY: string;
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  private genreMap: Map<string, number> = new Map();
  
  private readonly moviesCache = new Map<string, CacheEntry>();
  private readonly CACHE_TTL = 10 * 60 * 1000;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.TMDB_API_KEY = this.configService.get<string>('TMDB_API_KEY');
    if (!this.TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY não está definida nas variáveis de ambiente.');
    }
    this.fetchGenres();
    
    setInterval(() => this.cleanExpiredCache(), 5 * 60 * 1000);
  }

  private getMoviesCacheKey(criteria: any, page: number): string {
    return `movies_${JSON.stringify(criteria)}_${page}`;
  }

  private getFromMoviesCache(key: string): any | null {
    const entry = this.moviesCache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.moviesCache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setMoviesCache(key: string, data: any): void {
    this.moviesCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.moviesCache.entries()) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        this.moviesCache.delete(key);
      }
    }
  }

  private async fetchGenres() {
    try {
      const response = await firstValueFrom(this.httpService.get(
        `${this.TMDB_BASE_URL}/genre/movie/list?api_key=${this.TMDB_API_KEY}`,
      ));
      response.data.genres.forEach(genre => {
        this.genreMap.set(genre.name, genre.id);
      });
      console.log('Gêneros do TMDB carregados:', this.genreMap);
    } catch (error) {
      console.error('Erro ao buscar gêneros do TMDB:', error.message);
    }
  }

  getGenreId(genreName: string): number | undefined {
    return this.genreMap.get(genreName);
  }

  getMoviesByGenres(genreIds: number[], page: number = 1): Observable<AxiosResponse<any>> {
    const genres = genreIds.join(',');
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/discover/movie?api_key=${this.TMDB_API_KEY}&with_genres=${genres}&sort_by=popularity.desc&page=${page}&language=pt-BR`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Falha ao buscar filmes por gênero no TMDB', error.message);
      }),
    );
  }

  getPopularMovies(page: number = 1): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/movie/popular?api_key=${this.TMDB_API_KEY}&page=${page}&language=pt-BR`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Falha ao buscar filmes populares no TMDB', error.message);
      }),
    );
  }

  searchMovies(query: string, page: number = 1): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/search/movie?api_key=${this.TMDB_API_KEY}&query=${query}&page=${page}&language=pt-BR`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Falha ao pesquisar filmes no TMDB', error.message);
      }),
    );
  }

  getMovieDetails(id: number): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/movie/${id}?api_key=${this.TMDB_API_KEY}&language=pt-BR`,
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Falha ao buscar detalhes do filme no TMDB', error.message);
      }),
    );
  }

  getGenres(): Observable<{ id: number; name: string }[]> {
    const genres: { id: number; name: string }[] = [];
    this.genreMap.forEach((id, name) => {
      genres.push({ id, name });
    });
    return of(genres);
  }

  async getMoviesByCriteria(criteria: {
    generos_sugeridos?: string[];
    vote_average_min?: number;
    year_range?: { min?: number; max?: number };
    popularidade_minima?: number;
  }, page: number = 1): Promise<any> {
    const cacheKey = this.getMoviesCacheKey(criteria, page);
    const cached = this.getFromMoviesCache(cacheKey);
    if (cached) {
      console.log('✅ [TMDB] Filmes retornados do cache para critérios:', JSON.stringify(criteria));
      return cached;
    }

    try {
      console.log('🎬 [TMDB] Buscando filmes da API para critérios:', JSON.stringify(criteria));
      if (!criteria) {
        console.warn('⚠️ [TMDB] Critérios não fornecidos, usando padrão');
        criteria = { generos_sugeridos: [] };
      }

      if (!Array.isArray(criteria.generos_sugeridos)) {
        console.warn('⚠️ [TMDB] generos_sugeridos não é um array, usando padrão');
        criteria.generos_sugeridos = [];
      }

      const genreIds = (criteria.generos_sugeridos || [])
        .map(genreName => {
          if (!genreName || typeof genreName !== 'string') return null;
          
          let genreId = this.genreMap.get(genreName);
          if (!genreId) {
            for (const [name, id] of this.genreMap.entries()) {
              if (name.toLowerCase() === genreName.toLowerCase()) {
                genreId = id;
                break;
              }
            }
          }
          return genreId;
        })
        .filter(Boolean) as number[];

      if (genreIds.length === 0) {
        console.warn('⚠️ [TMDB] Nenhum gênero válido encontrado nos critérios:', criteria.generos_sugeridos);
        console.log('📋 [TMDB] Gêneros disponíveis no mapa:', Array.from(this.genreMap.keys()));
        
        const fallbackGenres = ['Drama', 'Comédia', 'Ação', 'Romance', 'Aventura'];
        for (const fallbackGenre of fallbackGenres) {
          const fallbackId = this.genreMap.get(fallbackGenre);
          if (fallbackId) {
            genreIds.push(fallbackId);
            if (genreIds.length >= 3) break;
          }
        }
        
        if (genreIds.length === 0) {
          console.error('❌ [TMDB] Nenhum gênero disponível no mapa. Tentando buscar filmes populares sem filtro de gênero.');
          const popularResponse = await firstValueFrom(
            this.httpService.get(
              `${this.TMDB_BASE_URL}/movie/popular?api_key=${this.TMDB_API_KEY}&page=${page}&language=pt-BR`
            )
          );
          this.setMoviesCache(cacheKey, popularResponse.data);
          return popularResponse.data;
        }
        
        console.log('✅ [TMDB] Usando gêneros de fallback:', genreIds);
      }

      const currentYear = new Date().getFullYear();
      const minYear = criteria.year_range?.min || currentYear - 15;
      const maxYear = criteria.year_range?.max || currentYear;
      const voteMin = criteria.vote_average_min || 6.0;

      const params = new URLSearchParams({
        api_key: this.TMDB_API_KEY,
        with_genres: genreIds.join(','),
        sort_by: 'popularity.desc',
        'vote_average.gte': voteMin.toString(),
        'primary_release_date.gte': `${minYear}-01-01`,
        'primary_release_date.lte': `${maxYear}-12-31`,
        page: page.toString(),
        language: 'pt-BR',
      });

      const response = await firstValueFrom(
        this.httpService.get(`${this.TMDB_BASE_URL}/discover/movie?${params.toString()}`)
      );

      this.setMoviesCache(cacheKey, response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ [TMDB] Erro ao buscar filmes por critérios:', error?.message || error);
      console.error('❌ [TMDB] Critérios recebidos:', JSON.stringify(criteria, null, 2));
      console.error('❌ [TMDB] Erro completo:', error?.response?.data || error);
      
      if (error?.message?.includes('gênero') || error?.message?.includes('genre') || error?.response?.status === 400) {
        console.log('🔄 [TMDB] Tentando buscar filmes populares como fallback...');
        try {
          const popularResponse = await firstValueFrom(
            this.httpService.get(
              `${this.TMDB_BASE_URL}/movie/popular?api_key=${this.TMDB_API_KEY}&page=${page}&language=pt-BR`
            )
          );
          this.setMoviesCache(cacheKey, popularResponse.data);
          return popularResponse.data;
        } catch (fallbackError) {
          console.error('❌ [TMDB] Erro no fallback também:', fallbackError);
        }
      }
      
      throw new InternalServerErrorException(
        `Falha ao buscar filmes por critérios no TMDB: ${error?.message || 'Erro desconhecido'}`,
        error?.response?.data || error
      );
    }
  }
}
