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
exports.WeatherService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("mongoose");
const mongoose_2 = require("@nestjs/mongoose");
let WeatherService = class WeatherService {
    weatherLogsModel;
    constructor(weatherLogsModel) {
        this.weatherLogsModel = weatherLogsModel;
    }
    async logWeatherPost(logsWeather) {
        const createdLog = new this.weatherLogsModel(logsWeather);
        return createdLog.save();
    }
    async logWeatherGet() {
        return this.weatherLogsModel.find().exec();
    }
    async logWeatherGetById(id) {
        return this.weatherLogsModel.findOne({ id_log: id }).exec();
    }
    async updateLogWeather(id, updateData) {
        return this.weatherLogsModel
            .findOneAndUpdate({ id_log: id }, updateData, { new: true })
            .exec();
    }
    async deleteLogWeather(id) {
        return this.weatherLogsModel.findOneAndDelete({ id_log: id }).exec();
    }
};
exports.WeatherService = WeatherService;
exports.WeatherService = WeatherService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_2.InjectModel)('WeatherLogs')),
    __metadata("design:paramtypes", [mongoose_1.Model])
], WeatherService);
//# sourceMappingURL=weather.service.js.map