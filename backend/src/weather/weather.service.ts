import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { PaginatedResponseDto } from './dto/paginated-response.dto';
import { LoggerService } from '../common/logger/logger.service';
import { sanitizeForLogging } from '../common/utils/log-sanitizer';
import { WeatherStatisticsService } from './services/weather-statistics.service';
import { WeatherInsightsGeneratorService } from './services/weather-insights-generator.service';
import { WeatherExportService } from './services/weather-export.service';

interface PaginationQuery {
  page?: number;
  limit?: number;
  city?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * Serviço principal para gerenciamento de logs climáticos
 * Delega operações específicas para serviços especializados
 */
@Injectable()
export class WeatherService {
  constructor(
    @InjectModel(WeatherLog.name) private weatherLogModel: Model<WeatherLogDocument>,
    @InjectConnection() private connection: Connection,
    private logger: LoggerService,
    private statisticsService: WeatherStatisticsService,
    private insightsGenerator: WeatherInsightsGeneratorService,
    private exportService: WeatherExportService,
  ) { }

  /**
   * Cria um novo log climático
   *
   * @param createWeatherLogDto - Dados do log a ser criado
   * @returns Log criado
   */
  async create(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLog> {
    this.logger.log('Creating weather log', {
      service: 'backend',
      module: 'weather',
      operation: 'create',
      payload: sanitizeForLogging(createWeatherLogDto),
    });
    const createdLog = new this.weatherLogModel(createWeatherLogDto);
    const saved = await createdLog.save();
    this.logger.log('Weather log created successfully', {
      service: 'backend',
      module: 'weather',
      operation: 'create',
      logId: saved._id.toString(),
    });
    return saved;
  }

  /**
   * Busca todos os logs climáticos com limite opcional
   *
   * @param limit - Número máximo de registros a retornar (padrão: 100)
   * @returns Array de logs ordenados por timestamp (mais recentes primeiro)
   */
  async findAll(limit?: number): Promise<WeatherLog[]> {
    const defaultLimit = 100;
    const queryLimit = limit ?? defaultLimit;

    this.logger.debug('Fetching weather logs', {
      service: 'backend',
      module: 'weather',
      operation: 'findAll',
      limit: queryLimit,
    });

    // Debug: verificar nome da coleção e contagem total
    try {
      const collectionName = this.weatherLogModel.collection.name;
      const totalCount = await this.weatherLogModel.countDocuments();
      this.logger.debug('Collection info', {
        service: 'backend',
        module: 'weather',
        collectionName,
        totalCount,
      });

      // Listar todas as coleções no banco para debug
      const db = this.connection.db;
      if (db) {
        const collections = await db.listCollections().toArray();
        this.logger.debug('Available collections', {
          service: 'backend',
          module: 'weather',
          collections: collections.map(c => c.name),
        });
      }
    } catch (err) {
      this.logger.warn('Could not get collection info', {
        service: 'backend',
        module: 'weather',
        error: err.message,
      });
    }

    const query = this.weatherLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(queryLimit);

    return query.exec();
  }

  /**
   * Busca logs climáticos com paginação e filtros opcionais
   *
   * @param query - Parâmetros de paginação e filtros (page, limit, city, startDate, endDate)
   * @returns Resposta paginada com logs e metadados de paginação
   */
  async findAllPaginated(query: PaginationQuery): Promise<PaginatedResponseDto<WeatherLog>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    this.logger.log('Fetching paginated weather logs', {
      service: 'backend',
      module: 'weather',
      operation: 'findAllPaginated',
      page,
      limit,
      city: query.city,
    });

    // Construir filtro
    const filter: any = {};
    if (query.city) {
      filter.city = { $regex: query.city, $options: 'i' };
    }
    if (query.startDate || query.endDate) {
      filter.timestamp = {};
      if (query.startDate) {
        filter.timestamp.$gte = query.startDate;
      }
      if (query.endDate) {
        filter.timestamp.$lte = query.endDate;
      }
    }

    // Buscar total de documentos
    const total = await this.weatherLogModel.countDocuments(filter);

    // Buscar documentos paginados
    const data = await this.weatherLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      page,
      limit,
      total,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    };
  }

  /**
   * Busca todas as cidades únicas que possuem dados climáticos
   *
   * @returns Array de nomes de cidades únicas
   */
  async getAvailableCities(): Promise<string[]> {
    this.logger.log('Fetching available cities', {
      service: 'backend',
      module: 'weather',
      operation: 'getAvailableCities',
    });

    const cities = await this.weatherLogModel.distinct('city').exec();
    // Filtrar valores nulos/undefined e ordenar
    const uniqueCities = cities
      .filter((city): city is string => !!city)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));

    this.logger.log('Available cities fetched', {
      service: 'backend',
      module: 'weather',
      operation: 'getAvailableCities',
      count: uniqueCities.length,
    });

    return uniqueCities;
  }

  /**
   * Exporta logs climáticos em formato CSV
   * Delega para WeatherExportService
   */
  async exportCsv(): Promise<string> {
    this.logger.log('Exporting weather logs to CSV', {
      service: 'backend',
      module: 'weather',
      operation: 'exportCsv',
    });

    try {
      const csv = await this.exportService.exportCsv();
      this.logger.log('CSV export completed', {
        service: 'backend',
        module: 'weather',
        operation: 'exportCsv',
      });
      return csv;
    } catch (error) {
      this.logger.error('Error exporting CSV', error.message, {
        service: 'backend',
        module: 'weather',
        operation: 'exportCsv',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Exporta logs climáticos em formato XLSX
   * Delega para WeatherExportService
   */
  async exportXlsx() {
    this.logger.log('Exporting weather logs to XLSX', {
      service: 'backend',
      module: 'weather',
      operation: 'exportXlsx',
    });

    try {
      const workbook = await this.exportService.exportXlsx();
      this.logger.log('XLSX export completed', {
        service: 'backend',
        module: 'weather',
        operation: 'exportXlsx',
      });
      return workbook;
    } catch (error) {
      this.logger.error('Error exporting XLSX', error.message, {
        service: 'backend',
        module: 'weather',
        operation: 'exportXlsx',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Gera insights e análises dos dados climáticos
   * Delega para WeatherInsightsGeneratorService
   *
   * @param city - Cidade para filtrar os insights (opcional)
   */
  async getInsights(city?: string): Promise<any> {
    this.logger.log('Generating AI insights', {
      service: 'backend',
      module: 'weather',
      operation: 'getInsights',
      city,
    });

    try {
      // Só passa city se ele estiver definido
      const insights = city
        ? await this.insightsGenerator.generateInsights(30, city)
        : await this.insightsGenerator.generateInsights(30);

      this.logger.log('Insights generated successfully', {
        service: 'backend',
        module: 'weather',
        operation: 'getInsights',
        dataPoints: insights.dataPoints,
        city,
      });

      return insights;
    } catch (error) {
      this.logger.error('Error generating insights', error.message, {
        service: 'backend',
        module: 'weather',
        operation: 'getInsights',
        error: error.message,
        city,
      });

      // Se não houver dados suficientes, retornar mensagem amigável
      if (error.message.includes('Dados insuficientes')) {
        return {
          message: 'Dados insuficientes para gerar insights',
          summary: `Não há dados climáticos suficientes para análise${city ? ` na cidade ${city}` : ''}.`,
        };
      }

      throw error;
    }
  }
}

