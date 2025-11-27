import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';

@ApiTags('pokemon')
@Controller('api/pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({ summary: 'Get paginated list of Pokemon' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'includeAlternativeForms', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of Pokemon' })
  async getPokemonList(
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
    @Query('includeAlternativeForms') includeAlternativeForms: string = 'false'
  ) {
    return this.pokemonService.getPokemonList(+limit, +offset, includeAlternativeForms === 'true');
  }

  @Get('types')
  @ApiOperation({ summary: 'Get list of Pokemon types' })
  @ApiResponse({ status: 200, description: 'List of Pokemon types' })
  async getPokemonTypes() {
    return this.pokemonService.getPokemonTypes();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search Pokemon by name or type' })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'includeAlternativeForms', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchPokemon(
    @Query('name') name?: string,
    @Query('type') type?: string,
    @Query('limit') limit: string = '20',
    @Query('offset') offset: string = '0',
    @Query('includeAlternativeForms') includeAlternativeForms: string = 'false'
  ) {
    return this.pokemonService.searchPokemon(name, type, +limit, +offset, includeAlternativeForms === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Pokemon details by ID' })
  @ApiResponse({ status: 200, description: 'Pokemon details' })
  @ApiResponse({ status: 404, description: 'Pokemon not found' })
  async getPokemonDetails(@Param('id') id: string) {
    return this.pokemonService.getPokemonDetails(id);
  }
}