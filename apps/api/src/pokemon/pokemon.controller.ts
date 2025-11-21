import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger'

import { JwtAuthGuard } from '../auth/jwt-auth.guard'
import { PokemonService } from './pokemon.service'

@ApiTags('Pokemon')
@ApiBearerAuth()
@Controller('explore/pokemon')
@UseGuards(JwtAuthGuard)
export class PokemonController {
  constructor(private readonly pokemonService: PokemonService) {}

  @Get()
  @ApiOperation({ summary: 'List Pokemon (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.pokemonService.findAll(page || 1, limit || 20)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Pokemon details by ID' })
  findOne(@Param('id') id: string) {
    return this.pokemonService.findById(parseInt(id))
  }
}
