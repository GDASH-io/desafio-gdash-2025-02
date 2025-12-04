import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 3000;

  // Enable Cross-Origin Resource Sharing (CORS) for frontend communication
  app.enableCors();

  // API Documentation Configuration (Swagger/OpenAPI)
  const config = new DocumentBuilder()
    .setTitle('GDASH API')
    .setDescription('Weather Monitoring System API')
    .setVersion('1.0')
    .addTag('Weather', 'Meteorological data ingestion and retrieval')
    .addTag('Users', 'Authentication and access control')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Swagger documentation: http://localhost:${port}/api`);
}
bootstrap();