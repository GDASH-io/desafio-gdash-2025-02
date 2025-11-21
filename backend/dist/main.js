"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
        ],
        credentials: true,
    });
    await app.listen(3000);
    console.log('🚀 Backend rodando em http://localhost:3000');
    console.log('✅ CORS habilitado para http://localhost:5173-5175');
}
bootstrap().catch((err) => {
    console.error('❌ Erro ao iniciar backend:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map