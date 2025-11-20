import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { Observable } from 'rxjs';

@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('popular')
  getPopularMovies(@Query('page', ParseIntPipe) page: number = 1): Observable<any> {
    return this.tmdbService.getPopularMovies(page);
  }

  @Get('search')
  searchMovies(
    @Query('query') query: string,
    @Query('page', ParseIntPipe) page: number = 1,
  ): Observable<any> {
    return this.tmdbService.searchMovies(query, page);
  }

  @Get('movie/:id')
  getMovieDetails(@Param('id', ParseIntPipe) id: number): Observable<any> {
    return this.tmdbService.getMovieDetails(id);
  }
}
