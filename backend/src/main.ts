import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: false,
      validationError: {
        target: false,
        value: false,
      },
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const config = new DocumentBuilder()
    .setTitle('Weather & Pokemon API')
    .setDescription(
      'API completa para gerenciamento de dados climáticos, usuários e consulta de Pokémons',
    )
    .setVersion('1.0')
    .addTag('Weather', 'Endpoints para dados climáticos e insights')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Pokemon', 'Consulta de informações de Pokémons')
    .addTag('Auth', 'Autenticação e autorização')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Insira o token JWT',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer('http://localhost:3000', 'Desenvolvimento')
    .addServer('https://api.exemplo.com', 'Produção')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log('🚀 API rodando em http://localhost:' + port);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
