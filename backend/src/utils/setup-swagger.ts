import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export const setupSwagger = (app: INestApplication) => {
  if (process.env.NODE_ENV === 'development') {
    const config = new DocumentBuilder()
      .setTitle('GDash API')
      .setDescription('API Docs')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: false, withCredentials: true },
      customSiteTitle: 'GDash API Documentation',
    });
  }
};
