import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SwapiService {
  private readonly baseURL = 'https://swapi.dev/api';

  async getPlanets(page: number = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/planets/?page=${page}`);
      return response.data;
    } catch (error) {
      throw new HttpException('Erro ao buscar dados da SWAPI', 502);
    }
  }

  async getPlanetById(id: string) {
    try {
      const response = await axios.get(`${this.baseURL}/planets/${id}/`);
      return response.data;
    } catch (error) {
      throw new HttpException('Planeta não encontrado', 404);
    }
  }
}