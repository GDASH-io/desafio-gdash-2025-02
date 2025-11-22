import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './weather.schema';
import { IngestLogDto } from './dto/ingest-log.dto';
import { ListLogsParams } from './interfaces/list-logs-params.interface';

@Injectable()
export class WeatherService {
	constructor(
		@InjectModel(WeatherLog.name) private readonly weatherModel: Model<WeatherLog>
	) {}

	async ingestLog(dto: IngestLogDto) {
		try {
			const doc = await this.weatherModel.create({
				...dto,
				source: dto.source || 'open-meteo'
			});
			return doc;
		} catch (err: any) {
			// Se for erro de índice único (duplicado), apenas retorna o registro já existente
			if (err?.code === 11000) {
				const existing = await this.weatherModel.findOne({
					'location.latitude': dto.location.latitude,
					'location.longitude': dto.location.longitude,
					timestamp: dto.timestamp
				});
				return existing;
			}
			throw err;
		}
	}

	async listLogs(params: ListLogsParams) {
		const page = params.page && params.page > 0 ? params.page : 1;
		const limit = params.limit && params.limit > 0 && params.limit <= 200 ? params.limit : 50;
		const skip = (page - 1) * limit;

		const filter: any = {};
		if (params.from || params.to) {
			filter.timestamp = {};
			if (params.from) filter.timestamp.$gte = params.from;
			if (params.to) filter.timestamp.$lte = params.to;
		}

		const [data, total] = await Promise.all([
			this.weatherModel
				.find(filter)
				.sort({ timestamp: -1 }) // mais recentes primeiro
				.skip(skip)
				.limit(limit)
				.lean(),
			this.weatherModel.countDocuments(filter)
		]);

		return {
			page,
			limit,
			total,
			hasNext: page * limit < total,
			data
		};
	}
}
