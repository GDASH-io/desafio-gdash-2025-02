import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PokemonService {
    private readonly logger = new Logger(PokemonService.name);
    private readonly baseUrl = 'https://pokeapi.co/api/v2/pokemon';

    async findAll(limit: number = 20, offset: number = 0) {
        try {
            const response = await axios.get(this.baseUrl, {
                params: { limit, offset },
            });
            return response.data;
        } catch (error) {
            this.logger.error(`Error fetching pokemon list: ${error.message}`);
            throw new HttpException(
                'Failed to fetch pokemon list',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }

    async findOne(id: string) {
        try {
            const response = await axios.get(`${this.baseUrl}/${id}`);
            return response.data;
        } catch (error) {
            this.logger.error(`Error fetching pokemon ${id}: ${error.message}`);
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                throw new HttpException('Pokemon not found', HttpStatus.NOT_FOUND);
            }
            throw new HttpException(
                'Failed to fetch pokemon details',
                HttpStatus.BAD_GATEWAY,
            );
        }
    }
}
