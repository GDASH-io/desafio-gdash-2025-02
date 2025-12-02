import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IWeatherRepository } from './weather.repository.interface';
import { Weather, WeatherDocument } from '../entities/weather.entity';
import { CreateWeatherDto } from '../dto/create-weather.dto';

@Injectable()
export class WeatherMongoRepository implements IWeatherRepository {
  constructor(
    @InjectModel(Weather.name)
    private readonly weatherModel: Model<WeatherDocument>,
  ) {}

  async create(data: CreateWeatherDto): Promise<Weather> {
    const createdLog = new this.weatherModel({
      ...data,
    });

    return createdLog.save();
  }

  async findAll(
    skip: number,
    limit: number,
  ): Promise<{ data: Weather[]; total: number }> {
    // Busca os dados paginados e ordenados
    const data = await this.weatherModel
      .find()
      .sort({ createdAt: -1 }) // Mais recente primeiro
      .skip(skip)
      .limit(limit)
      .lean() // .lean() retorna JSON puro (mais rápido para leitura)
      .exec();

    //  total para a paginação no frontend
    const total = await this.weatherModel.countDocuments();

    // O cast 'as unknown as Weather[]' é necessário porque o .lean() remove
    // os métodos do Mongoose e o TS pode reclamar da tipagem estrita
    return { data: data as unknown as Weather[], total };
  }

  async findLatest(limit: number): Promise<Weather[]> {
    // Usado pela IA para pegar o contexto recente
    const data = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return data as unknown as Weather[];
  }

  async findAllForExport(limit: number): Promise<Weather[]> {
    // Usado para gerar CSV/Excel
    const data = await this.weatherModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();

    return data as unknown as Weather[];
  }
}
