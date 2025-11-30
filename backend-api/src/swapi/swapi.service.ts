import { Injectable, HttpException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SwapiService {
  private readonly baseURL = 'https://swapi.dev/api';

  async getResource(resource: string, page: number = 1) {
    try {
      const response = await axios.get(`${this.baseURL}/${resource}/?page=${page}`);
      return response.data;
    } catch (error) {
      throw new HttpException(`Erro ao buscar ${resource}`, 502);
    }
  }

  async getResourceById(resource: string, id: string) {
    try {
      const response = await axios.get(`${this.baseURL}/${resource}/${id}/`);
      return response.data;
    } catch (error) {
      throw new HttpException('Recurso não encontrado', 404);
    }
  }
}