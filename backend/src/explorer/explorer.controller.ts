import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListPokemonDto } from './dto/list-pokemon.dto';
import { ExplorerService } from './explorer.service';

@Controller('explorer/pokemon')
export class ExplorerController {
    constructor(private readonly explorerService: ExplorerService) {}

    @Get()
    list(@Query() query: ListPokemonDto) {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        return this.explorerService.listPokemons(page, limit);
    }

    @Get(':name')
    detail(@Param('name') name: string) {
        return this.explorerService.getPokemon(name);
    }
}
