import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  
  await app.listen(3000);
  console.log('🚀 Backend rodando na porta 3000');
}
bootstrap();
