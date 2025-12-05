import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { PokeapiService } from './pokeapi.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('pokeapi')
@UseGuards(JwtAuthGuard)
export class PokeAPIController {
  constructor(private readonly pokeService: PokeapiService) {}

  @Get()
  async getPokemonList(@Query('limit') limit?: string, @Query('offset') offset?: string) {
    const l = limit ? parseInt(limit, 10) : 20;
    const o = offset ? parseInt(offset, 10) : 0;
    return this.pokeService.getPokemonList(l, o);
  }
}