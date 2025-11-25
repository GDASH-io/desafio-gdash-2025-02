"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherModule = void 0;
const common_1 = require("@nestjs/common");
const weather_controller_1 = require("./weather.controller");
const weather_service_1 = require("./weather.service");
const mongoose_1 = require("@nestjs/mongoose");
const user_schema_1 = require("../schema/user.schema");
const csv_export_service_1 = require("../exports/csv/csv-export.service");
const xlsx_export_service_1 = require("../exports/xlsx/xlsx-export.service");
let WeatherModule = class WeatherModule {
};
exports.WeatherModule = WeatherModule;
exports.WeatherModule = WeatherModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: 'WeatherLogs',
                    schema: user_schema_1.WeatherLogsSchema,
                },
            ]),
        ],
        controllers: [weather_controller_1.WeatherController],
        providers: [weather_service_1.WeatherService, csv_export_service_1.CsvExportService, xlsx_export_service_1.XlsxExportService],
    })
], WeatherModule);
//# sourceMappingURL=weather.module.js.map