import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TmdbService {
  private readonly TMDB_API_KEY: string;
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';
  private genreMap: Map<string, number> = new Map();

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.TMDB_API_KEY = this.configService.get<string>('TMDB_API_KEY');
    if (!this.TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is not defined in environment variables.');
    }
    this.fetchGenres();
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
        throw new InternalServerErrorException('Failed to fetch movies by genre from TMDB', error.message);
      }),
    );
  }

  getPopularMovies(page: number = 1): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/movie/popular?api_key=${this.TMDB_API_KEY}&page=${page}&language=pt-BR`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Failed to fetch popular movies from TMDB', error.message);
      }),
    );
  }

  searchMovies(query: string, page: number = 1): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/search/movie?api_key=${this.TMDB_API_KEY}&query=${query}&page=${page}&language=pt-BR`
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Failed to search movies from TMDB', error.message);
      }),
    );
  }

  getMovieDetails(id: number): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/movie/${id}?api_key=${this.TMDB_API_KEY}&language=pt-BR`,
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Failed to fetch movie details from TMDB', error.message);
      }),
    );
  }
}
