import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix para todas as rotas
  app.setGlobalPrefix('api'); // Poderia usar HTTP_PATHS.GLOBAL_PREFIX da pasta shared/constants

  // CORS para comunicação com o frontend
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  // Validação global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           GDASH Weather API with AI Insights              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Server: http://localhost:${port}/api
📊 Health: http://localhost:${port}/api/health
📚 Env: ${process.env.NODE_ENV || 'development'}
  `);
}
bootstrap();
