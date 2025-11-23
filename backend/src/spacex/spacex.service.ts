import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SpacexService {
  private readonly API_URL = 'https://api.spacexdata.com/v4/launches/query';

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const response = await axios.post(this.API_URL, {
        query: {},
        options: {
          page,
          limit,
          select: ['name', 'date_utc', 'success', 'rocket', 'details'],
          sort: { date_utc: 'desc' },
          populate: [{ path: 'rocket', select: { name: 1 } }],
        },
      });

      return {
        data: response.data.docs,
        meta: {
          total: response.data.totalDocs,
          page: response.data.page,
          limit: response.data.limit,
          totalPages: response.data.totalPages,
        },
      };
    } catch (error) {
      throw new HttpException(
        'Erro ao conectar com SpaceX API',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
