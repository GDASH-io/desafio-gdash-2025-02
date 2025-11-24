import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  app.enableCors({
    origin: process.env.NODE_ENV === 'development',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const config = new DocumentBuilder()
    .setTitle('GDash API')
    .setDescription('API for weather monitoring system')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: false,
  });

  if (document.components?.securitySchemes) {
    delete document.components.securitySchemes;
  }
  if (document.security) {
    document.security = [];
  }

  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: false,
      withCredentials: true,
    },
    customSiteTitle: 'GDash API Documentation',
  });

  await app.listen(process.env.BACKEND_PORT ?? 3001);
}
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
