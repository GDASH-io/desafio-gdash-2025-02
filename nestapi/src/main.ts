import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ResponseInterceptor } from './commmon/interceptors/response.interceptor';
import cookieParser from 'cookie-parser';   // <-- AQUI

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  app.use(cookieParser());                  // <-- AQUI

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());

  await app.listen(3000);
  console.log(`Servidor rodando em http://localhost:3000`);
}

bootstrap();
