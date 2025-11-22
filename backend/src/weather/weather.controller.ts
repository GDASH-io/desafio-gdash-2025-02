import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { WeatherService } from './weather.service';
import { IngestLogDto } from './dto/ingest-log.dto';

@Controller('weather')
export class WeatherController {
	constructor(private readonly weatherService: WeatherService) {}

	@Get('logs')
	async getLogs(
		@Query('page') page?: string,
		@Query('limit') limit?: string,
		@Query('from') from?: string,
		@Query('to') to?: string
	) {
		return this.weatherService.listLogs({
			page: page ? parseInt(page, 10) : undefined,
			limit: limit ? parseInt(limit, 10) : undefined,
			from: from ? new Date(from) : undefined,
			to: to ? new Date(to) : undefined
		});
	}

	@Post('logs')
	async ingest(@Body() body: IngestLogDto) {
		
		return this.weatherService.ingestLog(body);
	}
}
