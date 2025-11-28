import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Define o prefixo global /api conforme esperado pelo Go [cite: 242]
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(new ValidationPipe());
  
  // Habilita CORS para o futuro frontend
  app.enableCors();

  await app.listen(3000);
  console.log(`Backend rodando na porta 3000`);
}
bootstrap();