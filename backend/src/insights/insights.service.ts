import { Injectable } from '@nestjs/common';
import { WeatherService } from '../weather/weather.service';

@Injectable()
export class InsightsService {
    constructor(private weatherService: WeatherService) { }

    async generateInsights() {
        const logs = await this.weatherService.findAll();
        if (!logs || logs.length === 0) {
            return { message: 'No data available to generate insights.' };
        }

        const latest = logs[0];
        const insights = [];

        if (latest.temperature > 30) {
            insights.push('Está muito quente. Mantenha-se hidratado!');
        } else if (latest.temperature < 15) {
            insights.push('Está bastante frio. Use um casaco.');
        } else {
            insights.push('A temperatura está agradável.');
        }

        if (latest.humidity > 80) {
            insights.push('Alta umidade detectada. Pode parecer abafado.');
        }

        if (latest.rain > 0 || latest.precipitation > 0) {
            insights.push('Chuva detectada. Não esqueça o guarda-chuva.');
        }

        if (logs.length > 1) {
            const prev = logs[1];
            if (latest.temperature > prev.temperature + 2) {
                insights.push('A temperatura está subindo rapidamente.');
            } else if (latest.temperature < prev.temperature - 2) {
                insights.push('A temperatura está caindo rapidamente.');
            }
        }

        return {
            latest_data: latest,
            insights: insights,
            generated_at: new Date(),
        };
    }
}
