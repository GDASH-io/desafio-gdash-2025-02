import { Controller, Get, Query, Param } from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

@ApiTags('Public API (Pokémon)')
@Controller('public-api')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('pokemon')
  @ApiOperation({ summary: 'Get list of Pokémon with pagination' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of Pokémon retrieved successfully' })
  async getPokemon(
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.publicApiService.getPokemon(limit, offset);
  }

  @Get('pokemon/:name')
  @ApiOperation({ summary: 'Get details of a specific Pokémon' })
  @ApiResponse({ status: 200, description: 'Pokémon details retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pokémon not found' })
  async getPokemonDetails(@Param('name') name: string) {
    return this.publicApiService.getPokemonDetails(name);
  }
}
