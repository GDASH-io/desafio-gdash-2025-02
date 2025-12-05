import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config/env.validation';

const envVars = plainToInstance(EnvironmentVariables, process.env, {
  enableImplicitConversion: true,
});
const errors = validateSync(envVars, {
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
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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
