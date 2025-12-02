"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WeatherService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const weather_entity_1 = require("./entities/weather.entity");
const mongoose_2 = require("mongoose");
const generative_ai_1 = require("@google/generative-ai");
const XLSX = __importStar(require("xlsx"));
let WeatherService = WeatherService_1 = class WeatherService {
    weatherModel;
    logger = new common_1.Logger(WeatherService_1.name);
    genAI;
    constructor(weatherModel) {
        this.weatherModel = weatherModel;
        this.genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    }
    async create(createWeatherDto) {
        let generatedInsight = '';
        try {
            if (!process.env.GEMINI_API_KEY)
                throw new Error('Sem API KEY');
            const model = this.genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
            });
            const prompt = `Você é um meteorologista. Analise rapidamente:
- Temp: ${createWeatherDto.temperature}°C
- Umidade: ${createWeatherDto.humidity}%
- Vento: ${createWeatherDto.windSpeed} km/h
- Chance de Chuva: ${createWeatherDto.rainProbability}%

Dê APENAS 1 frase curta (máx 12 palavras) com um conselho prático considerando a chuva.
Exemplos:
- "Chuva provável (80%). Leve guarda-chuva."
- "Pouca chance de chuva. Dia ensolarado previsto!"
- "50% de chuva. Tempo instável. Tenha cuidado."
- "Ar seco e sem chuva. Dia perfeito pra atividades."

Responda SÓ COM A FRASE, nada mais.`;
            const result = await model.generateContent(prompt);
            const response = result.response;
            generatedInsight = response.text();
            this.logger.log(`✅ Insight (Gemini 2.5) gerado: "${generatedInsight}"`);
        }
        catch (error) {
            this.logger.warn(`⚠️ Falha na IA. Usando fallback. Erro: ${String(error).substring(0, 50)}`);
            generatedInsight = this.generateFallbackInsight(createWeatherDto);
        }
        const createdWeather = new this.weatherModel({
            ...createWeatherDto,
            insight: generatedInsight,
        });
        this.logger.log(`📊 Novo registro: ${createWeatherDto.temperature}°C, ${createWeatherDto.humidity}% umidade, ${createWeatherDto.windSpeed} km/h vento, ${createWeatherDto.rainProbability}% chuva`);
        return createdWeather.save();
    }
    generateFallbackInsight(dto) {
        if (dto.rainProbability > 70) {
            return 'Chuva forte prevista! Leve guarda-chuva.';
        }
        if (dto.rainProbability > 50) {
            return 'Chance alta de chuva. Tenha cuidado.';
        }
        if (dto.rainProbability > 20) {
            return 'Possível chuva. Acompanhe as atualizações.';
        }
        if (dto.humidity < 30)
            return 'Ar muito seco! Beba água e hidrate-se.';
        if (dto.humidity > 80)
            return 'Umidade alta. Sensação de abafamento.';
        if (dto.temperature > 30)
            return 'Calor intenso! Evite o sol forte.';
        if (dto.temperature < 15)
            return 'Frio detectado. Leve um casaco.';
        if (dto.windSpeed > 20)
            return 'Ventos fortes. Cuidado com janelas.';
        return 'Clima agradável e condições estáveis.';
    }
    findAll() {
        return this.weatherModel.find().sort({ createdAt: -1 }).exec();
    }
    findOne(id) {
        return `This action returns a #${id} weather`;
    }
    update(id, updateWeatherDto) {
        return `This action updates a #${id} weather`;
    }
    remove(id) {
        return `This action removes a #${id} weather`;
    }
    async exportToCsv() {
        try {
            const weatherData = await this.weatherModel.find().lean().exec();
            if (!weatherData || weatherData.length === 0) {
                return Buffer.from('No data available');
            }
            const headers = [
                'Data/Hora',
                'Temperatura (°C)',
                'Umidade (%)',
                'Vento (km/h)',
                'Chance de Chuva (%)',
                'Insight',
            ];
            const rows = weatherData.map((weather) => [
                new Date(weather.createdAt).toLocaleString('pt-BR'),
                weather.temperature?.toString() || 'N/A',
                weather.humidity?.toString() || 'N/A',
                weather.windSpeed?.toString() || 'N/A',
                weather.rainProbability?.toString() || 'N/A',
                weather.insight || 'N/A',
            ]);
            const csvContent = [
                headers.join(','),
                ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
            ].join('\n');
            this.logger.log(`✅ CSV exportado com ${weatherData.length} registros`);
            return Buffer.from(csvContent, 'utf-8');
        }
        catch (error) {
            this.logger.error(`❌ Erro ao exportar CSV: ${String(error).substring(0, 100)}`);
            throw error;
        }
    }
    async exportToXlsx() {
        try {
            const weatherData = await this.weatherModel.find().lean().exec();
            if (!weatherData || weatherData.length === 0) {
                return Buffer.from('No data available');
            }
            const xlsxData = weatherData.map((weather) => ({
                'Data/Hora': new Date(weather.createdAt).toLocaleString('pt-BR'),
                'Temperatura (°C)': weather.temperature || 'N/A',
                'Umidade (%)': weather.humidity || 'N/A',
                'Vento (km/h)': weather.windSpeed || 'N/A',
                'Chance de Chuva (%)': weather.rainProbability || 'N/A',
                Insight: weather.insight || 'N/A',
            }));
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(xlsxData);
            worksheet['!cols'] = [
                { wch: 20 },
                { wch: 15 },
                { wch: 12 },
                { wch: 12 },
                { wch: 18 },
                { wch: 25 },
            ];
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Weather Data');
            const xlsxBuffer = XLSX.write(workbook, {
                bookType: 'xlsx',
                type: 'buffer',
            });
            this.logger.log(`✅ XLSX exportado com ${weatherData.length} registros`);
            return xlsxBuffer;
        }
        catch (error) {
            this.logger.error(`❌ Erro ao exportar XLSX: ${String(error).substring(0, 100)}`);
            throw error;
        }
    }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = WeatherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(weather_entity_1.Weather.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WeatherService);
//# sourceMappingURL=weather.service.js.map