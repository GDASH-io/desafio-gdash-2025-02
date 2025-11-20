import { Controller, Get, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ExternalApiService } from './external-api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('external')
@Controller('external')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ExternalApiController {
  constructor(private readonly externalApiService: ExternalApiService) {}

  @Get('pokemon')
  @ApiOperation({ summary: 'Listar Pokémons com paginação e busca' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'search', required: false, type: String, example: 'pikachu' })
  getPokemonList(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('search') search?: string,
  ) {
    return this.externalApiService.getPokemonList(page || 1, limit || 20, search);
  }

  @Get('pokemon/:id')
  @ApiOperation({ summary: 'Buscar Pokémon por ID' })
  getPokemonById(@Param('id', ParseIntPipe) id: number) {
    return this.externalApiService.getPokemonById(id);
  }
}

