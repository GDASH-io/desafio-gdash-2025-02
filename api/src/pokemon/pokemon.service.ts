import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import {
  PokemonListResponseDto,
  PokemonListItemDto,
} from './dto/pokemon-list.dto';
import { PokemonDetailDto } from './dto/pokemon-detail.dto';

@Injectable()
export class PokemonService {
  private readonly baseUrl = 'https://pokeapi.co/api/v2';

  async findAll(
    offset: number = 0,
    limit: number = 20,
  ): Promise<{
    data: PokemonListItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const response = await axios.get<PokemonListResponseDto>(
        `${this.baseUrl}/pokemon`,
        {
          params: { offset, limit },
          timeout: 10000,
        },
      );

      const total = response.data.count;
      const totalPages = Math.ceil(total / limit);
      const page = Math.floor(offset / limit) + 1;

      return {
        data: response.data.results,
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new HttpException(
          `Erro ao buscar lista de Pokémons: ${error.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      }
      throw new HttpException(
        'Erro inesperado ao buscar Pokémons',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(idOrName: string): Promise<PokemonDetailDto> {
    try {
      const response = await axios.get<PokemonDetailDto>(
        `${this.baseUrl}/pokemon/${idOrName}`,
        {
          timeout: 10000,
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new HttpException(
            'Pokémon não encontrado',
            HttpStatus.NOT_FOUND,
          );
        }
        throw new HttpException(
          `Erro ao buscar detalhes do Pokémon: ${error.message}`,
          HttpStatus.BAD_GATEWAY,
        );
      }
      throw new HttpException(
        'Erro inesperado ao buscar detalhes do Pokémon',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
