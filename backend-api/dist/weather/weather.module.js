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
const mongoose_1 = require("@nestjs/mongoose");
const weather_controller_1 = require("../weather/weather.controller");
const weather_service_1 = require("../weather/weather.service");
const weather_log_schema_1 = require("../weather/schemas/weather-log.schema");
const weather_pagination_service_1 = require("../weather/weather-pagination.service");
const weather_pagination_controller_1 = require("../weather/weather-pagination.controller");
let WeatherModule = class WeatherModule {
};
exports.WeatherModule = WeatherModule;
exports.WeatherModule = WeatherModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                {
                    name: weather_log_schema_1.WeatherLog.name,
                    schema: weather_log_schema_1.WeatherLogSchema,
                },
            ]),
        ],
        providers: [weather_service_1.WeatherService, weather_pagination_service_1.WeatherPaginationService],
        controllers: [weather_controller_1.WeatherController, weather_pagination_controller_1.WeatherPaginationController],
    })
], WeatherModule);
//# sourceMappingURL=weather.module.js.map