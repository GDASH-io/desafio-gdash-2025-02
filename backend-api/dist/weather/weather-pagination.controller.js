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
exports.WeatherPaginationController = void 0;
const common_1 = require("@nestjs/common");
const weather_pagination_service_1 = require("./weather-pagination.service");
const pagination_dto_1 = require("./dto/pagination.dto");
let WeatherPaginationController = class WeatherPaginationController {
    weatherPaginationService;
    constructor(weatherPaginationService) {
        this.weatherPaginationService = weatherPaginationService;
    }
    async getPaginated(paginationDto) {
        return this.weatherPaginationService.paginate(paginationDto);
    }
};
exports.WeatherPaginationController = WeatherPaginationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [pagination_dto_1.PaginationDto]),
    __metadata("design:returntype", Promise)
], WeatherPaginationController.prototype, "getPaginated", null);
exports.WeatherPaginationController = WeatherPaginationController = __decorate([
    (0, common_1.Controller)('weather/paginated'),
    __metadata("design:paramtypes", [weather_pagination_service_1.WeatherPaginationService])
], WeatherPaginationController);
//# sourceMappingURL=weather-pagination.controller.js.map