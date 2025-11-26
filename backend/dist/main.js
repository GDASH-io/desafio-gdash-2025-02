"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const app_module_1 = require("./app.module");
const env_validation_1 = require("./config/env.validation");
const envVars = (0, class_transformer_1.plainToInstance)(env_validation_1.EnvironmentVariables, process.env, {
    enableImplicitConversion: true,
});
const errors = (0, class_validator_1.validateSync)(envVars, {
    skipMissingProperties: false,
});
if (errors.length > 0) {
    console.error('ERRO: Variáveis de ambiente inválidas:');
    errors.forEach((error) => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        console.error(`   - ${error.property}: ${constraints}`);
    });
    process.exit(1);
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
        ],
        credentials: true,
    });
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Backend rodando em http://localhost:${port}`);
    console.log('CORS habilitado para http://localhost:5173-5175');
    console.log('Variáveis de ambiente validadas com sucesso');
}
bootstrap().catch((err) => {
    console.error('Erro ao iniciar backend:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map