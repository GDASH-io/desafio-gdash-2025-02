import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog } from './weather.schema';
import { IngestLogDto } from './dto/ingest-log.dto';
import { ListLogsParams } from './interfaces/list-logs-params.interface';
import { ListLogsPublic, WeatherLogPublic } from './interfaces/weather-public.interface';
import { WeatherInsights } from './interfaces/insights.interface';

@Injectable()
export class WeatherService {
	constructor(
		@InjectModel(WeatherLog.name) private readonly weatherModel: Model<WeatherLog>
	) {}

	private toPublic(doc: any): WeatherLogPublic {
		const id = (doc._id && doc._id.toString) ? doc._id.toString() : String(doc._id);
		return {
			id,
			timestamp: new Date(doc.timestamp),
			location: doc.location,
			temperature2m: doc.temperature2m,
			relativeHumidity2m: doc.relativeHumidity2m,
			pressureMsl: doc.pressureMsl,
			windSpeed10m: doc.windSpeed10m,
			windDirection10m: doc.windDirection10m,
			windGusts10m: doc.windGusts10m,
			precipitation: doc.precipitation,
			precipitationProbability: doc.precipitationProbability,
			cloudcover: doc.cloudcover,
			weatherCode: doc.weatherCode,
			units: doc.units,
			fetchedAt: new Date(doc.fetchedAt),
			source: doc.source,
		};
	}

	async ingestLog(dto: IngestLogDto): Promise<WeatherLogPublic> {
		try {
			const doc = await this.weatherModel.create({
				...dto,
				source: dto.source || 'open-meteo'
			});
			return this.toPublic(doc);
		} catch (err: any) {
			// Se for erro de índice único (duplicado), apenas retorna o registro já existente
			if (err?.code === 11000) {
				const existing = await this.weatherModel.findOne({
					'location.latitude': dto.location.latitude,
					'location.longitude': dto.location.longitude,
					timestamp: dto.timestamp
				}).lean();
				return this.toPublic(existing);
			}
			throw err;
		}
	}

	async listLogs(params: ListLogsParams): Promise<ListLogsPublic> {
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
			data: data.map((d) => this.toPublic(d))
		};
	}

	async getLogsForExport(params: { from?: Date; to?: Date; limit?: number }): Promise<WeatherLogPublic[]> {
		const filter: any = {};
		if (params.from || params.to) {
			filter.timestamp = {};
			if (params.from) filter.timestamp.$gte = params.from;
			if (params.to) filter.timestamp.$lte = params.to;
		}
		const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 50000) : 10000;
		const docs = await this.weatherModel
			.find(filter)
			.sort({ timestamp: 1 })
			.limit(limit)
			.lean();
		return docs.map((d) => this.toPublic(d));
	}

	async getInsights(params: { windowHours?: number }): Promise<WeatherInsights> {
		const windowHours = params.windowHours && params.windowHours > 0 ? Math.min(params.windowHours, 168) : 24;
		const to = new Date();
		const from = new Date(to.getTime() - windowHours * 60 * 60 * 1000);

		const docs = await this.weatherModel
			.find({ timestamp: { $gte: from, $lte: to } })
			.sort({ timestamp: 1 })
			.lean();

		const pubs = docs.map((d) => this.toPublic(d));
		const n = pubs.length;

		const avg = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : undefined);
		const sum = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) : 0);

		const tempAvg = avg(pubs.map((p) => p.temperature2m));
		const humidityAvg = avg(pubs.map((p) => p.relativeHumidity2m));
		const windAvg = avg(pubs.map((p) => p.windSpeed10m));
		const precipSum = sum(pubs.map((p) => p.precipitation));

		// Tendência de temperatura: comparação média primeira metade vs segunda metade
		let trend: WeatherInsights['trend'] = { temperature: 'stable' };
		if (n >= 4) {
			const mid = Math.floor(n / 2);
			const firstAvg = avg(pubs.slice(0, mid).map((p) => p.temperature2m)) ?? 0;
			const secondAvg = avg(pubs.slice(mid).map((p) => p.temperature2m)) ?? 0;
			const delta = secondAvg - firstAvg;
			trend = {
				temperature: Math.abs(delta) < 0.3 ? 'stable' : delta > 0 ? 'rising' : 'falling',
				delta: parseFloat(delta.toFixed(2)),
			};
		}

		// Comfort score simples: 100 - penalidades por afastar da faixa ideal
		let comfortScore: number | undefined;
		if (tempAvg !== undefined && humidityAvg !== undefined && windAvg !== undefined) {
			const tempPenalty = Math.max(0, Math.abs(tempAvg - 26) * 3); // ideal ~26°C
			const humPenalty = Math.max(0, Math.abs(humidityAvg - 55) * 1.2); // ideal ~55%
			const windPenalty = Math.max(0, Math.max(0, windAvg - 20) * 1.5); // ventos fortes penalizam
			comfortScore = Math.max(0, Math.min(100, 100 - (tempPenalty + humPenalty + windPenalty)));
			comfortScore = parseFloat(comfortScore.toFixed(0));
		}

		const alerts: string[] = [];
		if (tempAvg !== undefined && tempAvg >= 32) alerts.push('Calor elevado. Hidratação recomendada.');
		if (tempAvg !== undefined && tempAvg <= 18) alerts.push('Temperatura baixa. Considere agasalho.');
		if (humidityAvg !== undefined && humidityAvg >= 75) alerts.push('Umidade alta. Sensação de abafamento.');
		if (precipSum >= 5) alerts.push('Chuva significativa no período.');

		const summaryParts: string[] = [];
		if (tempAvg !== undefined) summaryParts.push(`média ${tempAvg.toFixed(1)}°C`);
		if (humidityAvg !== undefined) summaryParts.push(`umidade ${humidityAvg.toFixed(0)}%`);
		summaryParts.push(`tendência ${trend.temperature}`);
		if (comfortScore !== undefined) summaryParts.push(`conforto ${comfortScore}/100`);

		return {
			timestamp: new Date().toISOString(),
			windowHours,
			metrics: { tempAvg, humidityAvg, windAvg, precipSum },
			trend,
			comfortScore,
			alerts,
			summary: `Últimas ${windowHours}h: ${summaryParts.join(', ')}.`,
		};
	}
}
