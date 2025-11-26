import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { TransformInterceptor } from './infra/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Prefixo global
  app.setGlobalPrefix('api/v1');
  
  // Validação global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Transform interceptor para converter _id em id
  app.useGlobalInterceptors(new TransformInterceptor());
  
  // CORS
  app.enableCors();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`API running on http://localhost:${port}/api/v1`);
  
  // Executar seed após inicialização
  if (process.env.NODE_ENV !== 'production') {
    setTimeout(async () => {
      try {
        // Seed será executado via script separado ou na inicialização do módulo
        console.log('API iniciada. Execute o seed manualmente se necessário: npm run seed');
      } catch (error) {
        console.error('Erro ao executar seed:', error);
      }
    }, 2000);
  }
}

bootstrap();
