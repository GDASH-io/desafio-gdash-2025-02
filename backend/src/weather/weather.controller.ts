import { Controller, Get, Query, Post, Body, UseGuards, Res } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { IngestLogDto } from './dto/ingest-log.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IngestApiKeyGuard } from '../auth/ingest-api-key.guard';
import { ListLogsPublic, WeatherLogPublic } from './interfaces/weather-public.interface';
import type { Response } from 'express';
import * as XLSX from 'xlsx';
import { WeatherInsights } from './interfaces/insights.interface';


@Controller('weather')
export class WeatherController {
	constructor(private readonly weatherService: WeatherService) {}

	@Get('logs')
	@UseGuards(JwtAuthGuard)
	async getLogs(
		@Query('page') page?: string,
		@Query('limit') limit?: string,
		@Query('from') from?: string,
		@Query('to') to?: string
	): Promise<ListLogsPublic> {
		return this.weatherService.listLogs({
			page: page ? parseInt(page, 10) : undefined,
			limit: limit ? parseInt(limit, 10) : undefined,
			from: from ? new Date(from) : undefined,
			to: to ? new Date(to) : undefined
		});
	}

	@Post('logs')
	// Ingest é protegido por API Key para o worker Go
	@UseGuards(IngestApiKeyGuard)
	async ingest(@Body() body: IngestLogDto): Promise<WeatherLogPublic> {
		return this.weatherService.ingestLog(body);
	}

	@Get('export.csv')
	@UseGuards(JwtAuthGuard)
	async exportCsv(
		@Query('from') from?: string,
		@Query('to') to?: string,
		@Query('limit') limit?: string,
		@Res({ passthrough: true }) res?: Response
	) {
		const fromDate = from ? new Date(from) : undefined;
		const toDate = to ? new Date(to) : undefined;
		const limitNum = limit ? parseInt(limit, 10) : undefined;
		const data = await this.weatherService.getLogsForExport({ from: fromDate, to: toDate, limit: limitNum });

		const headers = [
			'id','timestamp','latitude','longitude','geohash','temperature2m','relativeHumidity2m','pressureMsl',
			'windSpeed10m','windDirection10m','windGusts10m','precipitation','precipitationProbability','cloudcover',
			'weatherCode','units.temperature2m','units.windSpeed10m','units.pressureMsl','units.precipitation',
			'units.cloudcover','units.relativeHumidity2m','source','fetchedAt'
		];

		const esc = (val: any) => {
			if (val === null || val === undefined) return '';
			const s = String(val);
			if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
			return s;
		};

		const lines: string[] = [];
		lines.push(headers.join(','));
		for (const r of data) {
			lines.push([
				r.id,
				r.timestamp.toISOString(),
				r.location.latitude,
				r.location.longitude,
				r.location.geohash ?? '',
				r.temperature2m,
				r.relativeHumidity2m,
				r.pressureMsl,
				r.windSpeed10m,
				r.windDirection10m,
				r.windGusts10m ?? '',
				r.precipitation,
				r.precipitationProbability ?? '',
				r.cloudcover,
				r.weatherCode,
				r.units.temperature2m,
				r.units.windSpeed10m,
				r.units.pressureMsl,
				r.units.precipitation,
				r.units.cloudcover,
				r.units.relativeHumidity2m,
				r.source,
				r.fetchedAt.toISOString(),
			].map(esc).join(','));
		}

		const csv = lines.join('\n');
		if (res) {
			res.setHeader('Content-Type', 'text/csv; charset=utf-8');
			res.setHeader('Content-Disposition', 'attachment; filename="weather_export.csv"');
		}
		return csv;
	}

	@UseGuards(JwtAuthGuard)
	@Get('insights')
	async getInsights(@Query('windowHours') windowHours?: string): Promise<WeatherInsights> {
		const wh = windowHours ? parseInt(windowHours, 10) : undefined;
		return this.weatherService.getInsights({ windowHours: wh });
	}

	@Get('export.xlsx')
	@UseGuards(JwtAuthGuard)
	async exportXlsx(
		@Query('from') from?: string,
		@Query('to') to?: string,
		@Query('limit') limit?: string,
		@Res() res?: Response
	) {
		const fromDate = from ? new Date(from) : undefined;
		const toDate = to ? new Date(to) : undefined;
		const limitNum = limit ? parseInt(limit, 10) : undefined;
		const data = await this.weatherService.getLogsForExport({ from: fromDate, to: toDate, limit: limitNum });

		// Monta uma matriz com cabeçalho + dados
		const rows: (string | number)[][] = [
			[
				'id','timestamp','latitude','longitude','geohash','temperature2m','relativeHumidity2m','pressureMsl',
				'windSpeed10m','windDirection10m','windGusts10m','precipitation','precipitationProbability','cloudcover',
				'weatherCode','units.temperature2m','units.windSpeed10m','units.pressureMsl','units.precipitation',
				'units.cloudcover','units.relativeHumidity2m','source','fetchedAt'
			]
		];
		for (const r of data) {
			rows.push([
				r.id,
				r.timestamp.toISOString(),
				r.location.latitude,
				r.location.longitude,
				r.location.geohash ?? '',
				r.temperature2m,
				r.relativeHumidity2m,
				r.pressureMsl,
				r.windSpeed10m,
				r.windDirection10m,
				r.windGusts10m ?? '',
				r.precipitation,
				r.precipitationProbability ?? '',
				r.cloudcover,
				r.weatherCode,
				r.units.temperature2m,
				r.units.windSpeed10m,
				r.units.pressureMsl,
				r.units.precipitation,
				r.units.cloudcover,
				r.units.relativeHumidity2m,
				r.source,
				r.fetchedAt.toISOString(),
			]);
		}
		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.aoa_to_sheet(rows);
		XLSX.utils.book_append_sheet(wb, ws, 'Weather Logs');
		const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
		if (res) {
			res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
			res.setHeader('Content-Disposition', 'attachment; filename="weather_export.xlsx"');
			res.send(buffer);
		}
	}
}
