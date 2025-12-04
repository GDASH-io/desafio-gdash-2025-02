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
exports.WeatherLogSchema = exports.WeatherLog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let WeatherLog = class WeatherLog {
};
exports.WeatherLog = WeatherLog;
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], WeatherLog.prototype, "city", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], WeatherLog.prototype, "datetime", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], WeatherLog.prototype, "temperature", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], WeatherLog.prototype, "wind_speed", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], WeatherLog.prototype, "condition_code", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], WeatherLog.prototype, "humidity", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], WeatherLog.prototype, "precipitation_probability", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], WeatherLog.prototype, "received_at", void 0);
exports.WeatherLog = WeatherLog = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], WeatherLog);
exports.WeatherLogSchema = mongoose_1.SchemaFactory.createForClass(WeatherLog);
//# sourceMappingURL=weather-log.schema.js.map