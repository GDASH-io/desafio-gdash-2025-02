import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { appConfig } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: appConfig.cors.origin,
    credentials: true,
  });

  app.setGlobalPrefix(appConfig.apiPrefix);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const port = appConfig.port;
  await app.listen(port);

  console.log(`🚀 API rodando na porta ${port}`);
  console.log(`📝 Ambiente: ${appConfig.env}`);
  console.log(`🌐 Endpoint: http://localhost:${port}/${appConfig.apiPrefix}`);
}

bootstrap();
