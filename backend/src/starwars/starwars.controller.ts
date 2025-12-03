import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StarWarsService } from './starwars.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('starwars')
@Controller('starwars')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class StarWarsController {
  constructor(private readonly starWarsService: StarWarsService) {}

  @Get('people')
  @ApiOperation({ summary: 'Listar pessoas de Star Wars com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nome' })
  @ApiResponse({ status: 200, description: 'Lista de pessoas retornada com sucesso' })
  async getPeople(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.starWarsService.getPeople(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Get('planets')
  @ApiOperation({ summary: 'Listar planetas de Star Wars com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nome' })
  @ApiResponse({ status: 200, description: 'Lista de planetas retornada com sucesso' })
  async getPlanets(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.starWarsService.getPlanets(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }

  @Get('starships')
  @ApiOperation({ summary: 'Listar naves de Star Wars com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nome' })
  @ApiResponse({ status: 200, description: 'Lista de naves retornada com sucesso' })
  async getStarships(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.starWarsService.getStarships(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
  }
}

