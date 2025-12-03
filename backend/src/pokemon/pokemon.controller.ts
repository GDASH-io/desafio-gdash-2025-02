import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('pokemon')
@Controller('pokemon')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({ summary: 'Listar Pokémon com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Itens por página' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Buscar por nome' })
  @ApiResponse({ status: 200, description: 'Lista de Pokémon retornada com sucesso' })
  async getPokemonList(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.pokemonService.getPokemonList(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      search,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter detalhes de um Pokémon' })
  @ApiResponse({ status: 200, description: 'Detalhes do Pokémon retornados com sucesso' })
  @ApiResponse({ status: 404, description: 'Pokémon não encontrado' })
  async getPokemonById(@Param('id') id: string) {
    return this.pokemonService.getPokemonById(Number(id));
  }
}

