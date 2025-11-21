"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const users_service_1 = require("./users.service");
const users_controller_1 = require("./users.controller");
const user_entity_1 = require("./entities/user.entity");
const jwt_strategy_1 = require("../auth/jwt.strategy");
let UsersModule = class UsersModule {
};
exports.UsersModule = UsersModule;
exports.UsersModule = UsersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: user_entity_1.User.name, schema: user_entity_1.UserSchema }]),
            passport_1.PassportModule,
            jwt_1.JwtModule.register({
                secret: process.env.JWT_SECRET || 'your_jwt_secret_key_here',
                signOptions: { expiresIn: '24h' },
            }),
        ],
        controllers: [users_controller_1.UsersController],
        providers: [users_service_1.UsersService, jwt_strategy_1.JwtStrategy],
        exports: [users_service_1.UsersService],
    })
], UsersModule);
//# sourceMappingURL=users.module.js.map