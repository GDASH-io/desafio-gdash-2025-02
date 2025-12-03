import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ExternalService {
    private readonly baseUrl = 'https://pokeapi.co/api/v2';

    async getPokemons(limit: number = 20, offset: number = 0) {
        try {
            const response = await axios.get<any>(`${this.baseUrl}/pokemon`, {
                params: { limit, offset },
            });
            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch data from PokéAPI');
        }
    }

    async getPokemonDetail(name: string) {
        try {
            const response = await axios.get(this.baseUrl + '/pokemon/' + name);
            const data: any = response.data;
            return {
                name: data.name,
                height: data.height,
                weight: data.weight,
                types: data.types.map((t: any) => t.type.name),
                sprites: {
                    front_default: data.sprites.front_default,
                },
            };
        } catch (error) {
            throw new Error(`Failed to fetch details for ${name}`);
        }
    }
}
