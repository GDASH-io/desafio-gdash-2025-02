import { Controller, Get, Query, Param } from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
  constructor(private service: PokemonService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    return this.service.list(Number(page), Number(limit));
  }

  @Get(':idOrName')
  async detail(@Param('idOrName') idOrName: string) {
    return this.service.detail(idOrName);
  }
}
