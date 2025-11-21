"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./entities/user.entity");
let UsersService = UsersService_1 = class UsersService {
    userModel;
    jwtService;
    logger = new common_1.Logger(UsersService_1.name);
    constructor(userModel, jwtService) {
        this.userModel = userModel;
        this.jwtService = jwtService;
    }
    async create(createUserDto) {
        try {
            const existingUser = await this.userModel.findOne({ email: createUserDto.email });
            if (existingUser) {
                this.logger.warn(`❌ Tentativa de criar usuário com email já registrado: ${createUserDto.email}`);
                throw new common_1.ConflictException('Email já está registrado');
            }
            const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
            const user = new this.userModel({
                ...createUserDto,
                password: hashedPassword,
            });
            await user.save();
            this.logger.log(`✅ Usuário criado com sucesso: ${createUserDto.email}`);
            return this.sanitizeUser(user);
        }
        catch (error) {
            this.logger.error(`❌ Erro ao criar usuário: ${error.message}`);
            throw error;
        }
    }
    async findAll() {
        try {
            const users = await this.userModel.find().select('-password');
            this.logger.log(`📊 Total de usuários encontrados: ${users.length}`);
            return users;
        }
        catch (error) {
            this.logger.error(`❌ Erro ao listar usuários: ${error.message}`);
            throw error;
        }
    }
    async findOne(id) {
        try {
            const user = await this.userModel.findById(id).select('-password');
            if (!user) {
                this.logger.warn(`❌ Usuário não encontrado: ${id}`);
                throw new common_1.NotFoundException('Usuário não encontrado');
            }
            return user;
        }
        catch (error) {
            this.logger.error(`❌ Erro ao buscar usuário: ${error.message}`);
            throw error;
        }
    }
    async findByEmail(email) {
        try {
            const user = await this.userModel.findOne({ email });
            return user;
        }
        catch (error) {
            this.logger.error(`❌ Erro ao buscar usuário por email: ${error.message}`);
            throw error;
        }
    }
    async update(id, updateUserDto) {
        try {
            const updateData = { ...updateUserDto };
            if (updateUserDto.password) {
                updateData.password = await bcrypt.hash(updateUserDto.password, 10);
            }
            const user = await this.userModel.findByIdAndUpdate(id, updateData, { new: true }).select('-password');
            if (!user) {
                throw new common_1.NotFoundException('Usuário não encontrado');
            }
            this.logger.log(`✅ Usuário atualizado: ${id}`);
            return user;
        }
        catch (error) {
            this.logger.error(`❌ Erro ao atualizar usuário: ${error.message}`);
            throw error;
        }
    }
    async remove(id) {
        try {
            const user = await this.userModel.findByIdAndDelete(id);
            if (!user) {
                throw new common_1.NotFoundException('Usuário não encontrado');
            }
            this.logger.log(`✅ Usuário deletado: ${id}`);
            return { message: 'Usuário removido com sucesso' };
        }
        catch (error) {
            this.logger.error(`❌ Erro ao deletar usuário: ${error.message}`);
            throw error;
        }
    }
    async login(loginUserDto) {
        try {
            const user = await this.findByEmail(loginUserDto.email);
            if (!user) {
                this.logger.warn(`❌ Tentativa de login com email não registrado: ${loginUserDto.email}`);
                throw new common_1.UnauthorizedException('Email ou senha incorretos');
            }
            const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
            if (!isPasswordValid) {
                this.logger.warn(`❌ Tentativa de login com senha incorreta: ${loginUserDto.email}`);
                throw new common_1.UnauthorizedException('Email ou senha incorretos');
            }
            const access_token = this.jwtService.sign({ sub: user._id, email: user.email }, { expiresIn: '24h' });
            this.logger.log(`✅ Usuário autenticado: ${loginUserDto.email}`);
            return {
                access_token,
                user: this.sanitizeUser(user),
            };
        }
        catch (error) {
            this.logger.error(`❌ Erro no login: ${error.message}`);
            throw error;
        }
    }
    async validateUser(userId) {
        try {
            const user = await this.findOne(userId);
            return user;
        }
        catch (error) {
            this.logger.error(`❌ Erro ao validar usuário: ${error.message}`);
            throw error;
        }
    }
    sanitizeUser(user) {
        const { password, ...result } = user.toObject();
        return result;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        jwt_1.JwtService])
], UsersService);
//# sourceMappingURL=users.service.js.map