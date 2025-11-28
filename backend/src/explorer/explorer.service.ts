import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

export type PokemonListItem = {
    name: string;
    url: string;
};

export type PokemonDetail = {
    id: number;
    name: string;
    sprite?: string | null;
    types: string[];
    stats: { name: string; value: number }[];
};

@Injectable()
export class ExplorerService {
    private readonly logger = new Logger(ExplorerService.name);
    private readonly client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: 'https://pokeapi.co/api/v2',
            timeout: 10_000
        });
    }

    async listPokemons(page: number, limit: number) {
        const offset = Math.max(0, (page - 1) * limit);
        try {
            const { data } = await this.client.get('/pokemon', {
                params: { offset, limit }
            });

            const totalPages = Math.max(1, Math.ceil(data.count / limit));
            return {
                count: data.count,
                next: data.next,
                previous: data.previous,
                page,
                limit,
                totalPages,
                results: data.results as PokemonListItem[]
            };
        } catch (error) {
            this.logger.error('falha ao consultar PokéAPI', error);
            throw error;
        }
    }

    async getPokemon(name: string): Promise<PokemonDetail> {
        try {
            const { data } = await this.client.get(`/pokemon/${name.toLowerCase()}`);
            return {
                id: data.id,
                name: data.name,
                sprite: data.sprites?.front_default,
                types: (data.types ?? []).map((item: any) => item.type?.name ?? 'unknown'),
                stats: (data.stats ?? []).map((item: any) => ({
                    name: item.stat?.name ?? 'unknown',
                    value: item.base_stat ?? 0
                }))
            };
        } catch (error) {
            this.logger.error(`falha ao buscar detalhes de ${name}`, error);
            throw error;
        }
    }
}
