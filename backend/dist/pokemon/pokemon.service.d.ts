export declare class PokemonService {
    private readonly logger;
    private readonly baseUrl;
    findAll(limit?: number, offset?: number): Promise<any>;
    findOne(id: string): Promise<any>;
}
