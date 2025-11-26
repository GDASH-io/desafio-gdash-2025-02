import { WeatherLog } from '../entities/weather-log.entity';

export interface IWeatherLogRepository {
  create(log: Partial<WeatherLog>): Promise<WeatherLog>;
  createMany(logs: Partial<WeatherLog>[]): Promise<WeatherLog[]>;
  findAll(query: {
    page?: number;
    limit?: number;
    start?: Date;
    end?: Date;
    city?: string;
    sort?: 'asc' | 'desc';
  }): Promise<{ data: WeatherLog[]; total: number; page: number; limit: number; totalPages: number }>;
  findLatest(city?: string): Promise<WeatherLog | null>;
  findForExport(query: {
    start?: Date;
    end?: Date;
    city?: string;
  }): Promise<WeatherLog[]>;
}

