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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeatherSchema = exports.Weather = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let Weather = class Weather {
    temperature;
    humidity;
    windSpeed;
    insight;
};
exports.Weather = Weather;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Weather.prototype, "temperature", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Weather.prototype, "humidity", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Weather.prototype, "windSpeed", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Weather.prototype, "insight", void 0);
exports.Weather = Weather = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Weather);
exports.WeatherSchema = mongoose_1.SchemaFactory.createForClass(Weather);
//# sourceMappingURL=weather.entity.js.map