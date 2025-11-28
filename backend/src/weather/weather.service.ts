import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { Buffer } from 'node:buffer';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { WeatherLog, WeatherLogDocument } from './schemas/weather-log.schema';
import { AiInsight, AiInsightDocument } from './schemas/ai-insight.schema';

type CityInsight = {
    city: string;
    sampleCount: number;
    averageTemperature: number;
    averageHumidity: number;
    trend: 'subindo' | 'caindo' | 'estavel';
    comfortIndex: number | null;
    alerts: string[];
    lastSample: WeatherLog;
    narrative: string;
};

@Injectable()
export class WeatherService {
    constructor(
        @InjectModel(WeatherLog.name)
        private readonly weatherModel: Model<WeatherLogDocument>,
        @InjectModel(AiInsight.name)
        private readonly aiInsightModel: Model<AiInsightDocument>,
        private readonly configService: ConfigService,
    ) {}

    private readonly logger = new Logger(WeatherService.name);

    async create(payload: CreateWeatherLogDto): Promise<WeatherLog> {
        const log = new this.weatherModel({
            source: payload.source,
            city: payload.city,
            latitude: payload.latitude,
            longitude: payload.longitude,
            collectedAt: new Date(payload.collected_at),
            temperatureC: payload.temperature_c,
            humidityPercent: payload.humidity_percent,
            windSpeedKmh: payload.wind_speed_kmh,
            condition: payload.condition,
            raw: payload.raw,
            locationId: payload.location_id,
        });
        return log.save();
    }

    async findAll(): Promise<WeatherLog[]> {
        return this.weatherModel.find().sort({ collectedAt: -1 }).lean();
    }

    async findPaged(page = 1, limit = 10, city?: string): Promise<{
        data: WeatherLog[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> {
        const skip = (Math.max(page, 1) - 1) * limit;
        const filter = city ? { city: new RegExp(city, 'i') } : {};
        const [data, total] = await Promise.all([
            this.weatherModel
                .find(filter)
                .sort({ collectedAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.weatherModel.countDocuments(filter).exec()
        ]);
        const totalPages = Math.max(1, Math.ceil(total / limit));
        return { data, total, page: Math.max(page, 1), limit, totalPages };
    }

    async findCities(): Promise<string[]> {
        const cities = await this.weatherModel.distinct('city');
        return (cities as string[]).sort((a, b) => a.localeCompare(b));
    }

    async exportCsv(): Promise<string> {
        const logs = await this.findAll();
        const rows = logs.map((log) => this.mapForExport(log));
        const parser = new Parser({
            fields: [
                { label: 'Cidade', value: 'cidade' },
                { label: 'Coletado em', value: 'coletadoEm' },
                { label: 'Temperatura (°C)', value: 'temperatura' },
                { label: 'Umidade (%)', value: 'umidade' },
                { label: 'Vento (km/h)', value: 'vento' },
                { label: 'Condição', value: 'condicao' },
                { label: 'Fonte', value: 'fonte' },
            ],
        });
        return parser.parse(rows);
    }

    async exportXlsx(): Promise<Buffer> {
        const logs = await this.findAll();
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('logs');
        sheet.columns = [
            { header: 'Cidade', key: 'cidade', width: 20 },
            { header: 'Coletado em', key: 'coletadoEm', width: 24 },
            { header: 'Temperatura (°C)', key: 'temperatura', width: 18 },
            { header: 'Umidade (%)', key: 'umidade', width: 16 },
            { header: 'Vento (km/h)', key: 'vento', width: 16 },
            { header: 'Condição', key: 'condicao', width: 20 },
            { header: 'Fonte', key: 'fonte', width: 16 },
        ];
        logs.forEach((log) => {
            sheet.addRow({
                cidade: log.city,
                coletadoEm: this.formatDate(log.collectedAt),
                temperatura: this.formatNumber(log.temperatureC, 1),
                umidade: this.formatNumber(log.humidityPercent, 1),
                vento: this.formatNumber(log.windSpeedKmh, 1),
                condicao: log.condition,
                fonte: log.source,
            });
        });
        const result = await workbook.xlsx.writeBuffer();
        return Buffer.from(result);
    }

    async generateInsights(): Promise<Record<string, unknown>> {
        const now = new Date();
        const since = new Date(now);
        since.setHours(now.getHours() - 24);
        const logs = await this.weatherModel
            .find({ collectedAt: { $gte: since } })
            .sort({ collectedAt: 1 })
            .lean();

        if (!logs.length) {
            return { message: 'Sem dados suficientes para gerar insights ainda.' };
        }

        const byCity = this.groupByCity(logs);
        const cityInsights = byCity.map(([city, records]) => this.buildCityInsight(city, records));

        const hottest = [...cityInsights].sort(
            (a, b) => (b.lastSample.temperatureC ?? 0) - (a.lastSample.temperatureC ?? 0),
        )[0];
        const driest = [...cityInsights].sort((a, b) => (a.averageHumidity ?? 101) - (b.averageHumidity ?? 101))[0];
        const mostAlerts = [...cityInsights].sort((a, b) => b.alerts.length - a.alerts.length)[0];

        const summaryParts: string[] = [];
        if (hottest) {
            summaryParts.push(
                `Calor mais intenso em ${hottest.city} (${this.formatNumber(hottest.lastSample.temperatureC, 1)} C)`,
            );
        }
        if (driest && driest.averageHumidity !== undefined) {
            summaryParts.push(`Umidade mais baixa em ${driest.city} (${this.formatNumber(driest.averageHumidity, 1)}%)`);
        }
        if (mostAlerts && mostAlerts.alerts.length) {
            summaryParts.push(`Alertas prioritários em ${mostAlerts.city}: ${mostAlerts.alerts.join('; ')}`);
        }

        const comfortRanking = [...cityInsights]
            .filter((item) => item.comfortIndex !== null)
            .sort((a, b) => (b.comfortIndex ?? 0) - (a.comfortIndex ?? 0))
            .slice(0, 3)
            .map((item) => ({
                city: item.city,
                comfortIndex: item.comfortIndex,
                narrative: item.narrative,
            }));

        const model = this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';
        const result: Record<string, unknown> = {
            windowHours: 24,
            samples: logs.length,
            message: summaryParts.join(' | ') || 'Insights gerados com base nas últimas 24h.',
            comfortRanking,
            cities: cityInsights,
            model,
        };

        const aiSummary = await this.generateAiSummary(cityInsights, model);
        if (aiSummary) {
            result.aiSummary = aiSummary;
        }

        const saved = await this.aiInsightModel.create(result);
        return saved.toObject();
    }

    private mapForExport(log: WeatherLog): Record<string, unknown> {
        return {
            cidade: log.city,
            coletadoEm: this.formatDate(log.collectedAt),
            temperatura: this.formatNumber(log.temperatureC, 1),
            umidade: this.formatNumber(log.humidityPercent, 1),
            vento: this.formatNumber(log.windSpeedKmh, 1),
            condicao: log.condition,
            fonte: log.source,
        };
    }

    private formatDate(date?: Date) {
        if (!date) return '';
        return new Date(date).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    private formatNumber(value?: number, fractionDigits = 1) {
        if (value === undefined || value === null || Number.isNaN(value)) return '';
        return Number(value).toLocaleString('pt-BR', {
            minimumFractionDigits: fractionDigits,
            maximumFractionDigits: fractionDigits,
        });
    }

    private groupByCity(logs: WeatherLog[]): [string, WeatherLog[]][] {
        const map = new Map<string, WeatherLog[]>();
        logs.forEach((log) => {
            const key = log.city || 'desconhecido';
            const arr = map.get(key) ?? [];
            arr.push(log);
            map.set(key, arr);
        });
        return Array.from(map.entries());
    }

    private buildCityInsight(city: string, records: WeatherLog[]): CityInsight {
        const temperatures = records.map((item) => item.temperatureC).filter((v) => typeof v === 'number');
        const humidity = records
            .map((item) => (item.humidityPercent !== undefined ? item.humidityPercent : null))
            .filter((v): v is number => v !== null);
        const avgTemp = this.calcAverage(temperatures);
        const avgHumidity = this.calcAverage(humidity);
        const trend = this.calcTrend(records);
        const last = records[records.length - 1];
        const comfortIndex = this.comfortIndex(last.temperatureC, last.humidityPercent);
        const alerts = this.extractAlerts(last);

        const narrativeParts: string[] = [];
        if (comfortIndex !== null) {
            const comfortLabel =
                comfortIndex >= 80 ? 'muito confortável' : comfortIndex >= 60 ? 'confortável' : 'desconfortável';
            narrativeParts.push(`${city}: índice de conforto ${this.formatNumber(comfortIndex, 0)} (${comfortLabel})`);
        }
        if (trend === 'subindo') {
            narrativeParts.push('tendência de aquecimento nas últimas horas');
        } else if (trend === 'caindo') {
            narrativeParts.push('tendência de resfriamento nas últimas horas');
        }
        if (alerts.length) {
            narrativeParts.push(`alertas: ${alerts.join(', ')}`);
        }

        return {
            city,
            sampleCount: records.length,
            averageTemperature: Number(avgTemp.toFixed(1)),
            averageHumidity: Number(avgHumidity.toFixed(1)),
            trend,
            comfortIndex,
            alerts,
            lastSample: last,
            narrative: narrativeParts.join(' | ') || `${city}: variação dentro do esperado`,
        };
    }

    private calcAverage(values: number[]): number {
        if (!values.length) return 0;
        return values.reduce((acc, value) => acc + value, 0) / values.length;
    }

    private calcTrend(records: WeatherLog[]): 'subindo' | 'caindo' | 'estavel' {
        if (records.length < 2) return 'estavel';
        const first = records[0].temperatureC ?? 0;
        const last = records[records.length - 1].temperatureC ?? first;
        const delta = last - first;
        if (delta > 0.5) return 'subindo';
        if (delta < -0.5) return 'caindo';
        return 'estavel';
    }

    private comfortIndex(temperature?: number, humidity?: number | null): number | null {
        if (temperature === undefined || temperature === null || humidity === undefined || humidity === null) {
            return null;
        }
        const tempScore = 100 - Math.abs(22 - temperature) * 3;
        const humidityScore = 100 - Math.abs(50 - humidity) * 1.2;
        const score = Math.max(0, Math.min(100, tempScore * 0.6 + humidityScore * 0.4));
        return Number(score.toFixed(0));
    }

    private extractAlerts(log: WeatherLog): string[] {
        const alerts: string[] = [];
        if (log.temperatureC !== undefined) {
            if (log.temperatureC >= 35) alerts.push('alerta de calor extremo');
            else if (log.temperatureC >= 30) alerts.push('calor elevado, mantenha hidratação');
            else if (log.temperatureC <= 5) alerts.push('frio intenso, recomenda agasalho');
        }
        if (log.humidityPercent !== undefined) {
            if (log.humidityPercent >= 90) alerts.push('umidade muito alta, risco de chuva');
            else if (log.humidityPercent <= 25) alerts.push('ar muito seco');
        }
        if (log.windSpeedKmh !== undefined && log.windSpeedKmh >= 35) {
            alerts.push('ventos fortes nas últimas leituras');
        }
        return alerts;
    }

    async getLatestAiInsight(): Promise<Record<string, unknown> | null> {
        const insight = await this.aiInsightModel.findOne().sort({ createdAt: -1 }).lean();
        return insight ?? null;
    }

    private async generateAiSummary(cityInsights: CityInsight[], model: string): Promise<string | null> {
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) return null;
        try {
            const ranking = cityInsights
                .slice(0, 3)
                .map(
                    (city) =>
                        `${city.city}: temp media ${this.formatNumber(city.averageTemperature, 1)} C, ` +
                        `umidade media ${this.formatNumber(city.averageHumidity, 1)}%, ` +
                        `tendencia ${city.trend}, conforto ${city.comfortIndex ?? 'N/A'}, ` +
                        `alertas ${city.alerts.join('; ') || 'nenhum'}`,
                )
                .join(' | ');

            const prompt = [
                'Gere um resumo curto e acionavel sobre o clima e conforto das cidades monitoradas.',
                'Use as informacoes agregadas: ' + ranking,
                'Responda SEMPRE em markdown, seguindo exatamente este formato padrao:',
                '## Panorama rapido',
                '- bullet 1 com insight objetivo',
                '- bullet 2 com insight objetivo',
                '- bullet 3 com insight objetivo',
                '## Recomendacoes praticas',
                '- 3 bullets curtos, verbos no imperativo (hidratar, evitar sol, usar agasalho etc.)',
                '## Alertas e notas',
                '- liste riscos/alertas; se nao houver, escreva: \"Sem alertas criticos nas ultimas leituras.\"',
                'Portugues do Brasil, tom claro e direto.'
            ].join(' ');

            const response = await axios.post(
                'https://api.openai.com/v1/chat/completions',
                {
                    model,
                    messages: [
                        {
                            role: 'system',
                            content:
                                'Voce e um assistente metereologico conciso. Siga sempre o formato pedido e escreva em portugues do Brasil.',
                        },
                        { role: 'user', content: prompt },
                    ],
                    temperature: 0.4,
                    max_tokens: 160,
                },
                {
                    headers: {
                        Authorization: `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 10_000,
                },
            );

            const text = response.data?.choices?.[0]?.message?.content;
            return typeof text === 'string' ? text.trim() : null;
        } catch (error) {
            const status = axios.isAxiosError(error) ? error.response?.status : undefined;
            const reason =
                axios.isAxiosError(error) && error.response?.data
                    ? JSON.stringify(error.response.data)
                    : error instanceof Error
                      ? error.message
                      : String(error);
            this.logger.warn(`falha ao gerar resumo com OpenAI (${status ?? 'sem status'}): ${reason}`);
            return null;
        }
    }
}
