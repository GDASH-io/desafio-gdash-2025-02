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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherController = void 0;
const common_1 = require("@nestjs/common");
const weather_service_1 = require("../weather/weather.service");
const weather_log_schema_1 = require("../weather/schemas/weather-log.schema");
const ExcelJs = __importStar(require("exceljs"));
let WeatherController = class WeatherController {
    weatherService;
    constructor(weatherService) {
        this.weatherService = weatherService;
    }
    async createlog(logData) {
        console.log('Recebido log do Go Worker: ', logData);
        return this.weatherService.create(logData);
    }
    async findAll() {
        return this.weatherService.findAll();
    }
    async exportCsv() {
        return await this.weatherService.exportCsv();
    }
    async exportToXLSX(res) {
        const data = await this.weatherService.findAll();
        const workbook = new ExcelJs.Workbook();
        const worksheet = workbook.addWorksheet('Weather_Logs');
        worksheet.addRow([
            'Cidade',
            'Temperatura',
            'Umidade',
            'Velocidade do Vento',
            'Condição',
            'Criado em',
        ]);
        data.forEach((item) => {
            worksheet.addRow([
                item.location,
                item.temperature_c,
                item.humidity_percent,
                item.wind_speed_kmh,
                item.condition,
                new Date(item.timestamp),
            ]);
        });
        worksheet.columns.forEach((col) => {
            if (!col.eachCell)
                return;
            let maxLength = 10;
            col.eachCell({ includeEmpty: true }, (cell) => {
                const value = cell.value ? cell.value.toString() : '';
                maxLength = Math.max(maxLength, value.length);
            });
            col.width = maxLength + 2;
        });
        const buffer = await workbook.xlsx.writeBuffer();
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="weather.xlsx"');
        return res.send(buffer);
    }
};
exports.WeatherController = WeatherController;
__decorate([
    (0, common_1.Post)('logs'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [weather_log_schema_1.WeatherLog]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "createlog", null);
__decorate([
    (0, common_1.Get)('logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('export/csv'),
    (0, common_1.Header)('Conten-Type', 'text/csv'),
    (0, common_1.Header)('Content-Disposition', 'attachement; filename="weather.csv"'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "exportCsv", null);
__decorate([
    (0, common_1.Get)('export/xlsx'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "exportToXLSX", null);
exports.WeatherController = WeatherController = __decorate([
    (0, common_1.Controller)('api/weather'),
    __metadata("design:paramtypes", [weather_service_1.WeatherService])
], WeatherController);
//# sourceMappingURL=weather.controller.js.map