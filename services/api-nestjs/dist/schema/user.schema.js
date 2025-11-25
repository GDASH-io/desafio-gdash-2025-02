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
exports.WeatherLogsSchema = exports.WeatherLogs = void 0;
const mongoose_1 = require("@nestjs/mongoose");
let WeatherLogs = class WeatherLogs {
    temperatura;
    umidade;
    vento;
    condicao;
    probabilidade_chuva;
    data_coleta;
};
exports.WeatherLogs = WeatherLogs;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], WeatherLogs.prototype, "temperatura", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], WeatherLogs.prototype, "umidade", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], WeatherLogs.prototype, "vento", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], WeatherLogs.prototype, "condicao", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], WeatherLogs.prototype, "probabilidade_chuva", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], WeatherLogs.prototype, "data_coleta", void 0);
exports.WeatherLogs = WeatherLogs = __decorate([
    (0, mongoose_1.Schema)({
        timestamps: true,
        collection: 'weather_logs',
    })
], WeatherLogs);
exports.WeatherLogsSchema = mongoose_1.SchemaFactory.createForClass(WeatherLogs);
//# sourceMappingURL=user.schema.js.map