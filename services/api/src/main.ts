import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HTTP_PATHS } from './shared/constants/http-paths';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(HTTP_PATHS.GLOBAL_PREFIX);

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 4000;
  const env = process.env.NODE_ENV || 'development';

  await app.listen(port);

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║           GDASH Weather API with AI Insights              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 Server:  http://localhost:${port}/${HTTP_PATHS.GLOBAL_PREFIX}
📊 Health:  http://localhost:${port}/${HTTP_PATHS.GLOBAL_PREFIX}/health
📚 Env:     ${env}
  `);
}
bootstrap();
