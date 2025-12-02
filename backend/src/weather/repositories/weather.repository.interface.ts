import { CreateWeatherDto } from '../dto/create-weather.dto';
import { Weather } from '../entities/weather.entity';

export interface IWeatherRepository {
  create(data: CreateWeatherDto): Promise<Weather>;

  // Retorna dados e o total para calcular páginas
  findAll(
    skip: number,
    limit: number,
  ): Promise<{ data: Weather[]; total: number }>;

  // Busca os N (a preferir no weather.mongo.repository.ts) últimos registros (usado para o contexto da IA)
  findLatest(limit: number): Promise<Weather[]>;

  // Busca um volume maior de dados para gerar relatórios (CSV/Excel)
  findAllForExport(limit: number): Promise<Weather[]>;
}
