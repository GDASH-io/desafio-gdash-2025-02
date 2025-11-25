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
exports.logsWeatherDTO = void 0;
const swagger_1 = require("@nestjs/swagger");
class logsWeatherDTO {
    temperatura;
    umidade;
    vento;
    condicao;
    probabilidade_chuva;
    data_coleta;
}
exports.logsWeatherDTO = logsWeatherDTO;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 37.5, description: 'Temperatura em graus Celsius' }),
    __metadata("design:type", Number)
], logsWeatherDTO.prototype, "temperatura", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 80,
        description: 'Umidade relativa do ar em porcentagem',
    }),
    __metadata("design:type", Number)
], logsWeatherDTO.prototype, "umidade", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 15, description: 'Velocidade do vento em km/h' }),
    __metadata("design:type", Number)
], logsWeatherDTO.prototype, "vento", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Ensolarado', description: 'Condição climática' }),
    __metadata("design:type", String)
], logsWeatherDTO.prototype, "condicao", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 20,
        description: 'Probabilidade de chuva em porcentagem',
    }),
    __metadata("design:type", Number)
], logsWeatherDTO.prototype, "probabilidade_chuva", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2025-02-25T14:30:00Z',
        description: 'Data e hora da coleta dos dados',
    }),
    __metadata("design:type", String)
], logsWeatherDTO.prototype, "data_coleta", void 0);
//# sourceMappingURL=logsWeather.dto.js.map