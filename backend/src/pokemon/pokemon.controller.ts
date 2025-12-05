import { Controller, Get, Param, Query } from '@nestjs/common';
import { PokemonService } from './pokemon.service';

@Controller('pokemon')
export class PokemonController {
    constructor(private readonly pokemonService: PokemonService) { }

    @Get()
    findAll(@Query('limit') limit: string, @Query('offset') offset: string) {
        return this.pokemonService.findAll(+limit || 20, +offset || 0);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.pokemonService.findOne(id);
    }
}
