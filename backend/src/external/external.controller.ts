import { Controller, Get, Query, Param } from '@nestjs/common';
import { ExternalService } from './external.service';

@Controller('api/external')
export class ExternalController {
    constructor(private readonly externalService: ExternalService) { }

    @Get('pokemons')
    async getPokemons(@Query('limit') limit: number, @Query('offset') offset: number) {
        return this.externalService.getPokemons(limit, offset);
    }

    @Get('pokemon/:name')
    async getPokemonDetail(@Param('name') name: string) {
        return this.externalService.getPokemonDetail(name);
    }
}
