import { Controller, Get, Param, Query } from '@nestjs/common'; // <--- Adicione Query aqui
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  // @Query('page') pega o ?page=2 da URL
  findAll(@Query('page') page: number) {
    // Se não vier página, usa 1
    return this.pokemonService.findAll(page || 1);
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.pokemonService.findOne(name);
  }
}
