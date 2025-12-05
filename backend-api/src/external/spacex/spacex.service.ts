// spacex.service.ts
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SpacexService {
  private BASE_URL = 'https://api.spacexdata.com/v4';

  async getLaunches(page = 1, limit = 10) {
    const { data } = await axios.post(`${this.BASE_URL}/launches/query`, {
      query: {},
      options: { page, limit },
    });

    return data;
  }

  async getLaunchById(id: string) {
    const { data } = await axios.get(`${this.BASE_URL}/launches/${id}`);
    return data;
  }
}
