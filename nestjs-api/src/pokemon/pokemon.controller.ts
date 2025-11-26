import { Controller, Get, Param } from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  findAll() {
    // Pega a página da query string ?page=1 (ou usa 1 como padrão)
    const page = 1; // Para simplificar aqui, mas o ideal é pegar do @Query('page')
    return this.pokemonService.findAll(page);
  }

  // --- ROTA NOVA: Detalhes de um Pokémon ---
  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.pokemonService.findOne(name);
  }
}
