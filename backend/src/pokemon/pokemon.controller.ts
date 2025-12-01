import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import {
  PokemonListResponseDto,
  PokemonDetailResponseDto,
} from './dto/pokemon-response.dto';

@ApiTags('Pokemon')
@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar Pokémons',
    description: 'Retorna uma lista paginada de Pokémons com seus detalhes',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Quantidade de Pokémons por página',
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Posição inicial para paginação',
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de Pokémons retornada com sucesso',
    type: PokemonListResponseDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao buscar pokémons',
  })
  async getPokemons(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.pokemonService.getPokemons(limit, offset);
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar Pokémon por nome',
    description: 'Busca um Pokémon específico pelo nome',
  })
  @ApiQuery({
    name: 'name',
    required: true,
    type: String,
    description: 'Nome do Pokémon',
    example: 'pikachu',
  })
  @ApiResponse({
    status: 200,
    description: 'Pokémon encontrado',
    type: PokemonDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pokémon não encontrado',
  })
  async searchPokemon(@Query('name') name: string) {
    return this.pokemonService.searchPokemon(name);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar Pokémon por ID ou nome',
    description: 'Retorna detalhes completos de um Pokémon específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID ou nome do Pokémon',
    example: '25',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do Pokémon',
    type: PokemonDetailResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Pokémon não encontrado',
  })
  async getPokemonById(@Param('id') id: string) {
    return this.pokemonService.getPokemonById(id);
  }
}
