import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ["http://localhost:5173"],
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  });

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Backend rodando em http://localhost:${process.env.PORT || 3000}`);
}

bootstrap();
