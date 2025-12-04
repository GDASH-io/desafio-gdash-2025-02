import { Injectable, Logger } from "@nestjs/common";
import { WeatherLogRepository } from "../../infrastructure/repositories/weather-log.repository";
import { CreateWeatherLogDto } from "@/common/dto/weather-log.dto";
import { WeatherLogDocument } from "../../infrastructure/schemas/weather-log.schema";

@Injectable()
export class CreateWeatherLogUseCase {
    private readonly logger = new Logger(CreateWeatherLogUseCase.name);

    constructor(private readonly weatherLogRepository: WeatherLogRepository) {}

    async execute(createWeatherLogDto: CreateWeatherLogDto): Promise<WeatherLogDocument> {
        const weatherLog = await this.weatherLogRepository.create(createWeatherLogDto);

        this.logger.log(
            `Weather log created: ${weatherLog.location.city} - ${weatherLog.temperature}°C`
        );

        return weatherLog;
    }
}