import { Controller, Get, Param, Query, Logger } from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('api/pokemon')
export class PokemonController {
  private readonly logger = new Logger(PokemonController.name);

  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  async getPokemons(@Query('limit') limit?: number, @Query('offset') offset?: number) {
    this.logger.log(`📋 GET /api/pokemon - Listando Pokémons`);
    return this.pokemonService.getPokemons(
      limit ? parseInt(limit.toString()) : 20,
      offset ? parseInt(offset.toString()) : 0,
    );
  }

  @Get('search')
  async searchPokemon(@Query('q') query: string) {
    this.logger.log(`🔍 GET /api/pokemon/search?q=${query}`);
    return this.pokemonService.searchPokemon(query);
  }

  @Get(':idOrName')
  async getPokemonDetail(@Param('idOrName') idOrName: string) {
    this.logger.log(`🔍 GET /api/pokemon/${idOrName} - Detalhes`);
    return this.pokemonService.getPokemonDetail(idOrName);
  }
}
