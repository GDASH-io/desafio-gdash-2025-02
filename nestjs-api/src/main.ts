import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para o Frontend poder chamar a API
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
