import { Injectable } from '@nestjs/common';
import { request } from 'undici';
import { PublicApiResponse } from '../../../../types/explorer.types';
import { ExplorerPort } from '../../ports/explorer.ports';

@Injectable()
export class ExplorerAdapter implements ExplorerPort {
  constructor(
    private readonly BASE_URL: string,
    private readonly LIMIT?: number,
  ) {}

  async getAll(page_param: number): Promise<{
    data: PublicApiResponse['results'];
    has_next: boolean;
    total_pages: number;
  }> {
    const page = page_param > 0 ? page_param : 1;

    const { body, statusCode } = await request(
      `${this.BASE_URL}/people?limit=${this.LIMIT}&page=${page}`,
    );

    const errorStatus = statusCode !== 200;
    const dataParsed = (await body.json()) as PublicApiResponse;

    const total_pages = Math.ceil(dataParsed.count / (this.LIMIT ?? 1));

    return {
      data: errorStatus ? [] : dataParsed.results,
      has_next: errorStatus ? false : dataParsed.next !== null,
      total_pages: errorStatus ? 0 : total_pages,
    };
  }
}
