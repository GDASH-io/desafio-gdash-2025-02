import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AuthService } from './auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());

  try {
    const authService = app.get<AuthService>(AuthService);
    await authService.register('gdash@gdash.com', 'gdash2025');
    logger.log("Usuário padrão criado: gdash@gdash.com / gdash2025");
  } catch (e) {
    logger.warn("Usuário padrão já existe.");
  }
  await app.listen(process.env.PORT ?? 3000);
  logger.warn("Usuário padrão já existe.");
}
bootstrap();