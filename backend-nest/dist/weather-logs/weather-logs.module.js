"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherLogsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const weather_logs_controller_1 = require("./weather-logs.controller");
const weather_logs_service_1 = require("./weather-logs.service");
const weather_log_schema_1 = require("./weather-log.schema");
let WeatherLogsModule = class WeatherLogsModule {
};
exports.WeatherLogsModule = WeatherLogsModule;
exports.WeatherLogsModule = WeatherLogsModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: weather_log_schema_1.WeatherLog.name, schema: weather_log_schema_1.WeatherLogSchema }])],
        controllers: [weather_logs_controller_1.WeatherLogsController],
        providers: [weather_logs_service_1.WeatherLogsService],
    })
], WeatherLogsModule);
//# sourceMappingURL=weather-logs.module.js.map