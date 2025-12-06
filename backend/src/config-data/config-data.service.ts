import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigData, ConfigDataDocument } from './schemas/config-data.schema';
import { ConfigService } from '@nestjs/config';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class ConfigDataService {
  constructor(
    @InjectModel(ConfigData.name) private configModel: Model<ConfigDataDocument>,
    private configService: ConfigService,
    @Inject('COLLECTOR_SERVICE') private client: ClientProxy,
  ) {}

  async getConfig(): Promise<ConfigData> {
    const config = await this.configModel.findOne().sort({ createdAt: -1 }).exec();
    if (config) {
      return config;
    }

    // Fallback to env vars
    return {
      city: this.configService.get<string>('CITY_NAME', 'Sao Paulo'),
      latitude: this.configService.get<string>('LATITUDE', '-23.5505'),
      longitude: this.configService.get<string>('LONGITUDE', '-46.6333'),
    };
  }

  async updateConfig(city: string, latitude: string, longitude: string): Promise<ConfigData> {
    const newConfig = new this.configModel({ city, latitude, longitude });
    const savedConfig = await newConfig.save();
    this.client.emit('config_updated', { city, latitude, longitude });
    return savedConfig;
  }
}
