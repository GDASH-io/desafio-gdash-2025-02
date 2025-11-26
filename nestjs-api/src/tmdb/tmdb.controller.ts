import { Controller, Get, Query, Param, ParseIntPipe } from '@nestjs/common';
import { TmdbService } from './tmdb.service';
import { Observable } from 'rxjs';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class GetMoviesByGenresDto {
  @IsString()
  @IsNotEmpty()
  genres: string;

  @IsNumber()
  @IsOptional()
  page?: number;
}

@Controller('tmdb')
export class TmdbController {
  constructor(private readonly tmdbService: TmdbService) {}

  @Get('by-genres')
  getMoviesByGenres(@Query() query: GetMoviesByGenresDto): Observable<any> {
    const genreNamesArray = query.genres.split(',');
    const genreIds = genreNamesArray.map(genreName => this.tmdbService.getGenreId(genreName)).filter(Boolean) as number[];
    return this.tmdbService.getMoviesByGenres(genreIds, query.page);
  }

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

  @Get('genres') // Novo endpoint para buscar todos os gêneros
  getGenres(): Observable<any> {
    return this.tmdbService.getGenres();
  }
}
