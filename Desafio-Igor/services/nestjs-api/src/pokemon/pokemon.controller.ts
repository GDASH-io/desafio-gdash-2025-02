import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PokemonService } from './pokemon.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('pokemon')
@Controller('pokemon')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({ summary: 'List Pokemon with pagination' })
  getPokemonList(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.pokemonService.getPokemonList(limit, offset);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Pokemon details by ID' })
  getPokemonById(@Param('id') id: string) {
    return this.pokemonService.getPokemonById(+id);
  }
}
