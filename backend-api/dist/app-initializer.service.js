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
exports.AppInitializerService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const users_service_1 = require("./users/users.service");
let AppInitializerService = class AppInitializerService {
    configService;
    usersService;
    constructor(configService, usersService) {
        this.configService = configService;
        this.usersService = usersService;
    }
    async onModuleInit() {
        const adminEmail = this.configService.get('ADMIN_EMAIL');
        const adminPassword = this.configService.get('ADMIN_PASSWORD');
        const adminName = this.configService.get('ADMIN_NAME');
        if (!adminEmail || !adminPassword || !adminName) {
            console.warn('⚠️ CREDENCIAIS DE ADMIN VAZIAS: Verifique se o arquivo .env existe na raiz do projeto e contém ADMIN_EMAIL, ADMIN_PASSWORD e ADMIN_NAME.');
            return;
        }
        try {
            const existingUser = await this.usersService.findOne(adminEmail);
            if (!existingUser) {
                console.log(`👤 Criando usuário administrador padrão: ${adminEmail}...`);
                await this.usersService.create({
                    name: adminName,
                    email: adminEmail,
                    password: adminPassword,
                });
                console.log('✅ Usuário administrador padrão criado com sucesso!');
            }
            else {
                console.log('✅ Usuário administrador padrão já existe.');
            }
        }
        catch (e) {
            console.error('❌ Erro fatal ao inicializar o usuário administrador (Verifique o UserSchema e o DTO):', e);
        }
    }
};
exports.AppInitializerService = AppInitializerService;
exports.AppInitializerService = AppInitializerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        users_service_1.UsersService])
], AppInitializerService);
//# sourceMappingURL=app-initializer.service.js.map