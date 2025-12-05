// Este arquivo é como o botão "Ligar" da sua API
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para o frontend acessar depois
  app.enableCors();

  await app.listen(3000);
  console.log('API rodando na porta 3000');
}
bootstrap();