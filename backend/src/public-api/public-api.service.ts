import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PublicApiService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  async getPokemon(limit: number = 20, offset: number = 0) {
    try {
      const response = await axios.get(`${this.baseUrl}/pokemon`, {
        params: { limit, offset },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch data from external API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async getPokemonDetails(name: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/pokemon/${name}`);
      return response.data;
    } catch (error) {
      throw new HttpException(
        `Failed to fetch details for ${name}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
