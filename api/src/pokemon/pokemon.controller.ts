import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PokemonService } from './pokemon.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('pokemon')
@UseGuards(JwtAuthGuard)
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    // Suporta tanto 'page' quanto 'offset' (padrão PokéAPI)
    let offsetNumber = 0;
    const limitNumber = limit ? parseInt(limit) : 20;

    if (offset !== undefined) {
      // Se offset foi fornecido, usa diretamente (padrão PokéAPI)
      offsetNumber = parseInt(offset) || 0;
    } else if (page !== undefined) {
      // Se page foi fornecido, calcula offset
      const pageNumber = parseInt(page) || 1;
      offsetNumber = (pageNumber - 1) * limitNumber;
    }

    return this.pokemonService.findAll(offsetNumber, limitNumber);
  }

  @Get(':idOrName')
  async findOne(@Param('idOrName') idOrName: string) {
    return this.pokemonService.findOne(idOrName);
  }
}
