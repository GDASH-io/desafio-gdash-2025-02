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
exports.WeatherController = void 0;
const common_1 = require("@nestjs/common");
const weather_service_1 = require("./weather.service");
const create_weather_dto_1 = require("./dto/create-weather.dto");
const update_weather_dto_1 = require("./dto/update-weather.dto");
let WeatherController = class WeatherController {
    weatherService;
    constructor(weatherService) {
        this.weatherService = weatherService;
    }
    create(createWeatherDto) {
        return this.weatherService.create(createWeatherDto);
    }
    findAll() {
        return this.weatherService.findAll();
    }
    async exportCsv(res) {
        const csvBuffer = await this.weatherService.exportToCsv();
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename=weather_data.csv');
        res.send(csvBuffer);
    }
    async exportXlsx(res) {
        const xlsxBuffer = await this.weatherService.exportToXlsx();
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.header('Content-Disposition', 'attachment; filename=weather_data.xlsx');
        res.send(xlsxBuffer);
    }
    findOne(id) {
        return this.weatherService.findOne(+id);
    }
    update(id, updateWeatherDto) {
        return this.weatherService.update(+id, updateWeatherDto);
    }
    remove(id) {
        return this.weatherService.remove(+id);
    }
};
exports.WeatherController = WeatherController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_weather_dto_1.CreateWeatherDto]),
    __metadata("design:returntype", void 0)
], WeatherController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], WeatherController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/xlsx'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "exportXlsx", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WeatherController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_weather_dto_1.UpdateWeatherDto]),
    __metadata("design:returntype", void 0)
], WeatherController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], WeatherController.prototype, "remove", null);
exports.WeatherController = WeatherController = __decorate([
    (0, common_1.Controller)('weather'),
    __metadata("design:paramtypes", [weather_service_1.WeatherService])
], WeatherController);
//# sourceMappingURL=weather.controller.js.map