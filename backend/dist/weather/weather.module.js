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
const weather_service_1 = require("./weather.service");
const weather_controller_1 = require("./weather.controller");
const weather_entity_1 = require("./entities/weather.entity");
let WeatherModule = class WeatherModule {
};
exports.WeatherModule = WeatherModule;
exports.WeatherModule = WeatherModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: weather_entity_1.Weather.name, schema: weather_entity_1.WeatherSchema }]),
        ],
        controllers: [weather_controller_1.WeatherController],
        providers: [weather_service_1.WeatherService],
    })
], WeatherModule);
//# sourceMappingURL=weather.module.js.map