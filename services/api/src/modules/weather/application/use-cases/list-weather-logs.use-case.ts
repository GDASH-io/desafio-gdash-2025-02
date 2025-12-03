import { Injectable } from "@nestjs/common";
import { WeatherLogRepository } from "../../infrastructure/repositories/weather-log.repository";
import { ListWeatherLogDto } from "@/common/dto/weather-log.dto";

@Injectable()
export class ListWeatherLogsUseCase {
    constructor(private readonly weatherLogRepository: WeatherLogRepository) {}

    async execute(filters: ListWeatherLogDto) {
        return this.weatherLogRepository.findAll(filters)
    }
}