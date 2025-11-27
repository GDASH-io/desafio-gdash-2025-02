import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RickAndMortyResponseDto } from './rick-and-morty.dto';

@Injectable()
export class RickAndMortyService {
  private readonly logger = new Logger(RickAndMortyService.name);
  private readonly apiUrl = 'https://rickandmortyapi.com/api';

  async getCharacters(page: number = 1): Promise<RickAndMortyResponseDto> {
    try {
      const url = `${this.apiUrl}/character/?page=${page}`;
      
      this.logger.log(`Fetching characters from Rick and Morty API - Page ${page}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new HttpException(
          `Failed to fetch data from Rick and Morty API: ${response.statusText}`,
          response.status
        );
      }
      
      const data: RickAndMortyResponseDto = await response.json();
      
      // Traduz os resultados para português
      const translatedResults = data.results.map((char) => ({
        ...char,
        status: this.translateStatus(char.status),
        species: this.translateSpecies(char.species),
      }));
      
      return {
        ...data,
        results: translatedResults,
      };
    } catch (error) {
      this.logger.error(`Error fetching Rick and Morty characters: ${error.message}`);
      
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Failed to fetch Rick and Morty characters',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private translateStatus(status: string): string {
    const map: { [key: string]: string } = {
      'Alive': 'Vivo',
      'Dead': 'Morto',
      'unknown': 'Desconhecido'
    };
    return map[status] || status;
  }

  private translateSpecies(species: string): string {
    const map: { [key: string]: string } = {
      'Human': 'Humano',
      'Alien': 'Alienígena',
      'unknown': 'Desconhecido'
    };
    return map[species] || species;
  }
}