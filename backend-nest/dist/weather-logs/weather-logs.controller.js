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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherLogsController = void 0;
const common_1 = require("@nestjs/common");
const weather_logs_service_1 = require("./weather-logs.service");
const create_weather_log_dto_1 = require("./dto/create-weather-log.dto");
let WeatherLogsController = class WeatherLogsController {
    constructor(svc) {
        this.svc = svc;
    }
    async create(dto) {
        const saved = await this.svc.create(dto);
        return { message: 'Log salvo', id: saved._id };
    }
    async findAll() {
        return this.svc.findAll();
    }
};
exports.WeatherLogsController = WeatherLogsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_weather_log_dto_1.CreateWeatherLogDto]),
    __metadata("design:returntype", Promise)
], WeatherLogsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WeatherLogsController.prototype, "findAll", null);
exports.WeatherLogsController = WeatherLogsController = __decorate([
    (0, common_1.Controller)('weather/logs'),
    __metadata("design:paramtypes", [weather_logs_service_1.WeatherLogsService])
], WeatherLogsController);
//# sourceMappingURL=weather-logs.controller.js.map