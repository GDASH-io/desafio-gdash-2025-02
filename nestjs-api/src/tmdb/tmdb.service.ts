import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, map } from 'rxjs/operators';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';

@Injectable()
export class TmdbService {
  private readonly TMDB_API_KEY: string;
  private readonly TMDB_BASE_URL = 'https://api.themoviedb.org/3';

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.TMDB_API_KEY = this.configService.get<string>('TMDB_API_KEY');
    if (!this.TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is not defined in environment variables.');
    }
  }

  getPopularMovies(page: number = 1): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/movie/popular?api_key=${this.TMDB_API_KEY}&page=${page}
`    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Failed to fetch popular movies from TMDB', error.message);
      }),
    );
  }

  searchMovies(query: string, page: number = 1): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/search/movie?api_key=${this.TMDB_API_KEY}&query=${query}&page=${page}
`    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Failed to search movies from TMDB', error.message);
      }),
    );
  }

  getMovieDetails(id: number): Observable<AxiosResponse<any>> {
    return this.httpService.get(
      `${this.TMDB_BASE_URL}/movie/${id}?api_key=${this.TMDB_API_KEY}`,
    ).pipe(
      map(response => response.data),
      catchError(error => {
        throw new InternalServerErrorException('Failed to fetch movie details from TMDB', error.message);
      }),
    );
  }
}
