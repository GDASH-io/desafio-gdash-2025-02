import { WeatherLog } from "src/domain/enterprise/entities/weather-log";

export interface FindManyParams {
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
  location?: string;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export abstract class WeatherLogRepository {
  abstract create(weatherLog: WeatherLog): Promise<void>;
  abstract findById(id: string): Promise<WeatherLog | null>;
  abstract findLatest(): Promise<WeatherLog | null>;
  abstract findMany(
    params?: FindManyParams
  ): Promise<PaginationResult<WeatherLog>>;
  abstract findRecent(limit: number): Promise<WeatherLog[]>;
  abstract findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<WeatherLog[]>;
  abstract delete(id: string): Promise<void>;
}
