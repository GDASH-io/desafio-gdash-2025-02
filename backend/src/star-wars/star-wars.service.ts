import { Injectable, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class StarWarsService {
  private readonly baseUrl = 'https://swapi.dev/api';

  // 1. Listar Naves
  async findAll(page: number = 1) {
    try {
      // Fetch é nativo, não precisa importar nada
      const response = await fetch(`${this.baseUrl}/starships/?page=${page}`);

      if (!response.ok) {
        throw new HttpException('Erro na SWAPI', response.status);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Se der erro de rede ou timeout
      throw new HttpException(
        'Falha ao conectar com Star Wars API',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 2. Detalhes de uma Nave
  async findOne(id: number) {
    try {
      const response = await fetch(`${this.baseUrl}/starships/${id}/`);

      if (!response.ok) {
        throw new HttpException('Nave não encontrada', HttpStatus.NOT_FOUND);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar nave',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
