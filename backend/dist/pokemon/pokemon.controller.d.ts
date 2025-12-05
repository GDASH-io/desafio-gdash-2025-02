import { PokemonService } from './pokemon.service';
export declare class PokemonController {
    private readonly pokemonService;
    constructor(pokemonService: PokemonService);
    findAll(limit: string, offset: string): Promise<any>;
    findOne(id: string): Promise<any>;
}
