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
exports.SpacexController = void 0;
const common_1 = require("@nestjs/common");
const spacex_service_1 = require("./spacex.service");
let SpacexController = class SpacexController {
    spacexService;
    constructor(spacexService) {
        this.spacexService = spacexService;
    }
    async getLaunches(page = '1', limit = '10') {
        return this.spacexService.getLaunches(Number(page), Number(limit));
    }
    async getLaunchById(id) {
        return this.spacexService.getLaunchById(id);
    }
};
exports.SpacexController = SpacexController;
__decorate([
    (0, common_1.Get)('launches'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SpacexController.prototype, "getLaunches", null);
__decorate([
    (0, common_1.Get)('launches/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SpacexController.prototype, "getLaunchById", null);
exports.SpacexController = SpacexController = __decorate([
    (0, common_1.Controller)('/api/external/spacex'),
    __metadata("design:paramtypes", [spacex_service_1.SpacexService])
], SpacexController);
//# sourceMappingURL=spacex.controller.js.map