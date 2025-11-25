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
const swagger_1 = require("@nestjs/swagger");
const weather_service_1 = require("./weather.service");
const csv_export_service_1 = require("../exports/csv/csv-export.service");
const xlsx_export_service_1 = require("../exports/xlsx/xlsx-export.service");
const logsWeather_dto_1 = require("../DTO/logsWeather.dto");
const common_2 = require("@nestjs/common");
let WeatherController = class WeatherController {
    weatherService;
    csvExportService;
    xlsxExportService;
    constructor(weatherService, csvExportService, xlsxExportService) {
        this.weatherService = weatherService;
        this.csvExportService = csvExportService;
        this.xlsxExportService = xlsxExportService;
    }
    async logWeatherData(logsWeather) {
        return await this.weatherService.logWeatherPost(logsWeather);
    }
    async getAllLogs() {
        return await this.weatherService.logWeatherGet();
    }
    async getLogById(id) {
        const log = await this.weatherService.logWeatherGetById(id);
        if (!log) {
            throw new common_1.HttpException('Log não encontrado', common_1.HttpStatus.NOT_FOUND);
        }
        return log;
    }
    async updateLog(id, updateData) {
        const updatedLog = await this.weatherService.updateLogWeather(id, updateData);
        if (!updatedLog) {
            throw new common_1.HttpException('Log não encontrado', common_1.HttpStatus.NOT_FOUND);
        }
        return updatedLog;
    }
    async deleteLog(id) {
        const deletedLog = await this.weatherService.deleteLogWeather(id);
        if (!deletedLog) {
            throw new common_1.HttpException('Log não encontrado', common_1.HttpStatus.NOT_FOUND);
        }
        return { message: 'Log deletado com sucesso', data: deletedLog };
    }
    async exportLogsToCsv() {
        const headers_csv = [
            "temperatura",
            "umidade",
            "vento",
            "condicao",
            "probabilidade_chuva",
            "data_coleta",
        ];
        const logs = await this.weatherService.logWeatherGet();
        const csv_generated = this.csvExportService.generateCsvStream(logs, headers_csv);
        return new common_2.StreamableFile(csv_generated);
    }
    async exportLogsToXlsx() {
        const headers_xlsx = [
            "temperatura",
            "umidade",
            "vento",
            "condicao",
            "probabilidade_chuva",
            "data_coleta",
        ];
        const logs = await this.weatherService.logWeatherGet();
        const xlsx_generated = await this.xlsxExportService.generateXlsxBuffer(logs, headers_xlsx);
        return new common_2.StreamableFile(xlsx_generated);
    }
};
exports.WeatherController = WeatherController;
__decorate([
    (0, common_1.Post)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Criar novo log de clima' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Log criado com sucesso' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logsWeather_dto_1.logsWeatherDTO]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "logWeatherData", null);
__decorate([
    (0, common_1.Get)('logs'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar todos os logs de clima' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de logs retornada' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "getAllLogs", null);
__decorate([
    (0, common_1.Get)('logs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Buscar log de clima por ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do log' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Log encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Log não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "getLogById", null);
__decorate([
    (0, common_1.Put)('logs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Atualizar log de clima' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do log' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Log atualizado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Log não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "updateLog", null);
__decorate([
    (0, common_1.Delete)('logs/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Deletar log de clima' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID do log' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Log deletado com sucesso' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Log não encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "deleteLog", null);
__decorate([
    (0, common_1.Get)('export-csv'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar logs de clima em CSV' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'CSV gerado com sucesso' }),
    (0, common_1.Header)('Content-Type', 'text/csv'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="export.csv"'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "exportLogsToCsv", null);
__decorate([
    (0, common_1.Get)('export-xlsx'),
    (0, swagger_1.ApiOperation)({ summary: 'Exportar logs de clima em XLSX' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'XLSX gerado com sucesso' }),
    (0, common_1.Header)('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'),
    (0, common_1.Header)('Content-Disposition', 'attachment; filename="export.xlsx"'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WeatherController.prototype, "exportLogsToXlsx", null);
exports.WeatherController = WeatherController = __decorate([
    (0, swagger_1.ApiTags)('weather'),
    (0, common_1.Controller)('weather'),
    __metadata("design:paramtypes", [weather_service_1.WeatherService,
        csv_export_service_1.CsvExportService,
        xlsx_export_service_1.XlsxExportService])
], WeatherController);
//# sourceMappingURL=weather.controller.js.map