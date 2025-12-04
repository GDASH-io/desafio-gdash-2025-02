import { Injectable, Logger } from "@nestjs/common";
import { WeatherLogRepository } from "../../infrastructure/repositories/weather-log.repository";
import { ExportService } from "../../infrastructure/services/export.service";
import { ListWeatherLogDto } from "@/common/dto/weather-log.dto";

@Injectable()
export class ExportWeatherDataUseCase {
    private readonly logger = new Logger(ExportWeatherDataUseCase.name);

    constructor(
        private readonly weatherLogRepository: WeatherLogRepository,
        private readonly exportService: ExportService,
    ) {}

    async executeCSV(filters: ListWeatherLogDto): Promise<string> {
        const { data } = await this.weatherLogRepository.findAll({
            ...filters,
            limit: 10000,
        });

        const csv = await this.exportService.exportToCsv(data);

        this.logger.log(`Exported ${data.length} records to CSV`);

        return csv;
    }

    async executeXLSX(filters: ListWeatherLogDto): Promise<Buffer> {
        const { data } = await this.weatherLogRepository.findAll({
            ...filters,
            limit: 10000,
        });

        const xlsx = await this.exportService.exportToXLSX(data);

        this.logger.log(`Exported ${data.length} records to XLSX`);

        return Buffer.from(xlsx)
    }
}