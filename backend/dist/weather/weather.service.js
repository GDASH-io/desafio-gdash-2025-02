"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
            const prompt = `
        Atue como um meteorologista. Analise estes dados:
        - Temperatura: ${createWeatherDto.temperature}°C
        - Umidade: ${createWeatherDto.humidity}% (Ideal: 40-60%)
        - Vento: ${createWeatherDto.windSpeed} km/h
        
        Dê um conselho curto (máx 15 palavras) considerando o conforto térmico e se o ar está muito seco ou úmido.
        Responda em Português do Brasil.
      `;
            const result = await model.generateContent(prompt);
            const response = await result.response;
            generatedInsight = response.text();
            this.logger.log(`Insight (Gemini 2.5) gerado: "${generatedInsight}"`);
        }
        catch (error) {
            this.logger.warn(`Falha na IA. Usando fallback. Erro: ${error.message}`);
            generatedInsight = this.generateFallbackInsight(createWeatherDto);
        }
        const createdWeather = new this.weatherModel({
            ...createWeatherDto,
            insight: generatedInsight,
        });
        return createdWeather.save();
    }
    generateFallbackInsight(dto) {
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
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = WeatherService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(weather_entity_1.Weather.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WeatherService);
//# sourceMappingURL=weather.service.js.map