"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var PokemonService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokemonService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let PokemonService = PokemonService_1 = class PokemonService {
    logger = new common_1.Logger(PokemonService_1.name);
    baseUrl = 'https://pokeapi.co/api/v2/pokemon';
    async findAll(limit = 20, offset = 0) {
        try {
            const response = await axios_1.default.get(this.baseUrl, {
                params: { limit, offset },
            });
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error fetching pokemon list: ${error.message}`);
            throw new common_1.HttpException('Failed to fetch pokemon list', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
    async findOne(id) {
        try {
            const response = await axios_1.default.get(`${this.baseUrl}/${id}`);
            return response.data;
        }
        catch (error) {
            this.logger.error(`Error fetching pokemon ${id}: ${error.message}`);
            if (axios_1.default.isAxiosError(error) && error.response?.status === 404) {
                throw new common_1.HttpException('Pokemon not found', common_1.HttpStatus.NOT_FOUND);
            }
            throw new common_1.HttpException('Failed to fetch pokemon details', common_1.HttpStatus.BAD_GATEWAY);
        }
    }
};
exports.PokemonService = PokemonService;
exports.PokemonService = PokemonService = PokemonService_1 = __decorate([
    (0, common_1.Injectable)()
], PokemonService);
//# sourceMappingURL=pokemon.service.js.map