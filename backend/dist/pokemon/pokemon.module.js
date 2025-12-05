"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PokemonModule = void 0;
const common_1 = require("@nestjs/common");
const pokemon_service_1 = require("./pokemon.service");
const pokemon_controller_1 = require("./pokemon.controller");
let PokemonModule = class PokemonModule {
};
exports.PokemonModule = PokemonModule;
exports.PokemonModule = PokemonModule = __decorate([
    (0, common_1.Module)({
        controllers: [pokemon_controller_1.PokemonController],
        providers: [pokemon_service_1.PokemonService],
    })
], PokemonModule);
//# sourceMappingURL=pokemon.module.js.map