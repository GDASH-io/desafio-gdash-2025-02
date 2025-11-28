import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CollectorConfig, CollectorConfigDocument } from './schemas/config.schema';
import { Location, LocationDocument } from '../locations/schemas/location.schema';

@Injectable()
export class ConfigService {
    private readonly logger = new Logger(ConfigService.name);
    constructor(
        @InjectModel(CollectorConfig.name)
        private readonly configModel: Model<CollectorConfigDocument>,
        @InjectModel(Location.name)
        private readonly locationModel: Model<LocationDocument>,
    ) {}

    async ensureDefault(): Promise<CollectorConfig> {
        const existing = await this.configModel.findOne().lean();
        if (existing) {
            return existing as CollectorConfig;
        }
        const created = new this.configModel({ collectIntervalMinutes: 60 });
        const saved = await created.save();
        this.logger.log('configuração de coletor criada com intervalo 60 minutos');
        return saved;
    }

    async get(): Promise<CollectorConfig> {
        const cfg = await this.configModel.findOne().lean();
        if (cfg) return cfg as CollectorConfig;
        return this.ensureDefault();
    }

    async update(collectIntervalMinutes: number): Promise<CollectorConfig> {
        const interval = this.normalizeInterval(collectIntervalMinutes);
        const cfgPromise = this.configModel
            .findOneAndUpdate({}, { collectIntervalMinutes: interval }, { new: true, upsert: true })
            .lean();
        const updateLocationsPromise = this.locationModel.updateMany({}, { intervalMinutes: interval }).lean();
        const [cfg] = await Promise.all([cfgPromise, updateLocationsPromise]);
        return cfg as CollectorConfig;
    }

    private normalizeInterval(value: number): number {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 60;
        }
        return parsed;
    }
}