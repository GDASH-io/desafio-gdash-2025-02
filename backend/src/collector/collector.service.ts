import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { ConfigService as CollectorConfigService } from '../config/config.service';
import { LocationsService } from '../locations/locations.service';
import { WeatherService } from '../weather/weather.service';

type LocationLike = {
    _id?: string;
    id?: string;
    name: string;
    latitude: number;
    longitude: number;
    intervalMinutes?: number;
    active?: boolean;
};

type OpenMeteoResponse = {
    current_weather?: {
        temperature?: number;
        windspeed?: number;
        weathercode?: number;
        time?: string;
    };
    hourly?: {
        time?: string[];
        relativehumidity_2m?: number[];
    };
};

@Injectable()
export class CollectorService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(CollectorService.name);
    private timer: NodeJS.Timeout | null = null;
    private lastRunMs = 0;

    constructor(
        private readonly locationsService: LocationsService,
        private readonly configService: CollectorConfigService,
        private readonly weatherService: WeatherService,
    ) {}

    async onModuleInit() {
        await this.configService.ensureDefault();
        this.start();
    }

    onModuleDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private start() {
        this.timer = setInterval(() => {
            this.runCycle().catch((error) =>
                this.logger.error('falha no ciclo do coletor', this.stringifyError(error)),
            );
        }, 60 * 1000);

        this.runCycle().catch((error) =>
            this.logger.error('falha no primeiro ciclo do coletor', this.stringifyError(error)),
        );
    }

    private async runCycle() {
        const config = await this.configService.get();
        const fallbackInterval = this.normalizeMinutes(config.collectIntervalMinutes, 60);
        const locations = await this.locationsService.findActive();
        const now = Date.now();

        const elapsedMsSinceLast = now - this.lastRunMs;
        const requiredMs = fallbackInterval * 60 * 1000;
        if (this.lastRunMs !== 0 && elapsedMsSinceLast < requiredMs) {
            return;
        }

        if (!locations.length) {
            this.logger.debug('nenhum local ativo para coletar agora');
            return;
        }

        await Promise.all(locations.map((loc) => this.collectForLocation(loc as LocationLike, fallbackInterval)));
        this.lastRunMs = now;
    }

    private async collectForLocation(loc: LocationLike, fallbackInterval: number) {
        const key = loc._id?.toString() || loc.id || loc.name;
        const intervalMinutes = this.normalizeMinutes(loc.intervalMinutes, fallbackInterval);

        try {
            const weather = await this.fetchFromOpenMeteo(loc.latitude, loc.longitude);
            await this.weatherService.create({
                source: 'open-meteo',
                city: loc.name,
                latitude: loc.latitude,
                longitude: loc.longitude,
                collected_at: new Date().toISOString(),
                temperature_c: weather.temperatureC,
                humidity_percent: weather.humidityPercent,
                wind_speed_kmh: weather.windSpeedKmh,
                condition: weather.condition,
                raw: weather.raw,
                location_id: key,
            });
            this.logger.log(
                `coleta registrada para ${loc.name} (intervalo ${intervalMinutes} minutos, latitude ${loc.latitude}, longitude ${loc.longitude})`,
            );
        } catch (error) {
            this.logger.error(`falha ao coletar dados para ${loc.name}: ${this.stringifyError(error)}`);
        }
    }

    private normalizeMinutes(value: unknown, fallback: number): number {
        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed <= 0) {
            return Math.max(1, Number(fallback) || 60);
        }
        return Math.max(1, parsed);
    }

    private async fetchFromOpenMeteo(latitude: number, longitude: number) {
        const { data } = await axios.get<OpenMeteoResponse>('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude,
                longitude,
                current_weather: true,
                hourly: 'relativehumidity_2m',
                timezone: 'UTC',
            },
            headers: { 'Cache-Control': 'no-cache' },
            timeout: 10_000,
        });

        const current = data.current_weather || {};
        const hourly = data.hourly || {};
        const humidity = this.pickHumidity(hourly, current.time);
        const temperature = typeof current.temperature === 'number' ? current.temperature : undefined;
        const wind = typeof current.windspeed === 'number' ? current.windspeed : undefined;

        if (temperature === undefined) {
            throw new Error('resposta do provedor sem temperatura atual');
        }

        return {
            temperatureC: temperature,
            windSpeedKmh: wind,
            humidityPercent: humidity,
            condition: this.translateWeatherCode(current.weathercode),
            raw: current,
        };
    }

    private pickHumidity(hourly: OpenMeteoResponse['hourly'], currentTime?: string) {
        if (!hourly) return undefined;
        const timestamps = hourly.time || [];
        const values = hourly.relativehumidity_2m || [];
        if (!timestamps.length || !values.length) return undefined;

        if (currentTime) {
            const index = timestamps.indexOf(currentTime);
            if (index >= 0 && values[index] !== undefined) {
                return values[index];
            }
        }
        return values[0];
    }

    private translateWeatherCode(code?: number): string {
        const mapping: Record<number, string> = {
            0: 'ceu limpo',
            1: 'principalmente limpo',
            2: 'parcialmente nublado',
            3: 'nublado',
            45: 'neblina',
            48: 'neblina umida',
            51: 'chuvisco leve',
            53: 'chuvisco moderado',
            55: 'chuvisco forte',
            61: 'chuva fraca',
            63: 'chuva moderada',
            65: 'chuva forte',
            71: 'neve fraca',
            73: 'neve moderada',
            75: 'neve forte',
            80: 'chuva isolada',
            81: 'chuva frequente',
            82: 'chuva intensa',
        };
        return mapping[code ?? -1] || 'nao definido';
    }

    private stringifyError(error: unknown): string {
        if (error instanceof Error) {
            return `${error.message}${error.stack ? ` | ${error.stack}` : ''}`;
        }
        return String(error);
    }
}
