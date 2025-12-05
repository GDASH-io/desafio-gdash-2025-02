import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { WeatherData } from './schemas/weather-data.schema';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent';

const debounceWithBackoff = (fn: (...args: any[]) => Promise<void>, delay: number) => {
	let timeoutId: NodeJS.Timeout | null = null;
	let attempt = 0;
	const maxAttempts = 5;

	return async function (...args: any[]) {
		if (timeoutId) clearTimeout(timeoutId);

		const execute = async () => {
			attempt = 0;
			while (attempt < maxAttempts) {
				try {
					await fn(...args);
					return;
				} catch (error) {
					attempt++;
					if (attempt >= maxAttempts) return;
					const waitTime = delay * Math.pow(2, attempt);
					await new Promise((r) => setTimeout(r, waitTime));
				}
			}
		};

		timeoutId = setTimeout(execute, delay);
	};
};

@Injectable()
export class WeatherService {
	private readonly logger = new Logger(WeatherService.name);
	private generateInsightDebounced: (dataId: string, temp: number, wind: number) => void;

	constructor(@InjectModel('WeatherData') private readonly weatherModel: Model<WeatherData>) {
		this.generateInsightDebounced = debounceWithBackoff(this.generateInsight.bind(this), 2000);
	}

	async processAndSave(payload: any) {
		const newRecord = new this.weatherModel({ timestamp: new Date(payload.timestamp), ...payload });
		const saved = await newRecord.save();
		this.generateInsightDebounced(saved._id.toString(), saved.temperature, saved.wind_speed);
		return saved;
	}

	async findAll() {
		return this.weatherModel.find().sort({ timestamp: -1 }).limit(100).exec();
	}

	async exportData(): Promise<string> {
		const data = await this.weatherModel.find().sort({ timestamp: -1 }).exec();
		let csv = 'timestamp,latitude,longitude,temperature,wind_speed,weather_code,insight\n';
		data.forEach((item) => {
			const row = [
				item.timestamp.toISOString(),
				item.latitude,
				item.longitude,
				item.temperature,
				item.wind_speed,
				item.weather_code,
				`"${item.insight ? item.insight.replace(/"/g, '""') : ''}"`,
			].join(',');
			csv += row + '\n';
		});
		return csv;
	}

	private async generateInsight(dataId: string, temperature: number, windSpeed: number) {
		if (!GEMINI_API_KEY) {
			this.logger.warn('GEMINI_API_KEY não configurada. Insight de IA desabilitado.');
			return;
		}

		const systemPrompt =
			"Você é um analista climático amigável e conciso. Dada a temperatura em Celsius e a velocidade do vento em km/h, forneça um insight de uma única frase sobre o clima e como isso pode afetar o dia.";
		const userQuery = `Temperatura: ${temperature}°C, Velocidade do Vento: ${windSpeed} km/h. Gere um insight.`;

		try {
			const payload = { contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
			const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, payload, { headers: { 'Content-Type': 'application/json' } });
			const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
			if (text) {
				await this.weatherModel.findByIdAndUpdate(dataId, { insight: text }).exec();
				this.logger.log(`Insight salvo para ${dataId}`);
			}
		} catch (err) {
			this.logger.error('Erro gerando insight:', err);
      throw err;
    }
  }
}