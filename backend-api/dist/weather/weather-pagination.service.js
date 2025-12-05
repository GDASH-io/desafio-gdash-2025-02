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
exports.WeatherPaginationService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const weather_log_schema_1 = require("./schemas/weather-log.schema");
let WeatherPaginationService = class WeatherPaginationService {
    weatherLogModel;
    constructor(weatherLogModel) {
        this.weatherLogModel = weatherLogModel;
    }
    async paginate(pagination) {
        const { page, limit } = pagination;
        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.weatherLogModel
                .find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            this.weatherLogModel.countDocuments(),
        ]);
        return {
            data,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        };
    }
};
exports.WeatherPaginationService = WeatherPaginationService;
exports.WeatherPaginationService = WeatherPaginationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(weather_log_schema_1.WeatherLog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WeatherPaginationService);
//# sourceMappingURL=weather-pagination.service.js.map