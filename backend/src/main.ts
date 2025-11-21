import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 Backend rodando em http://localhost:3000');
  console.log('✅ CORS habilitado para http://localhost:5173-5175');
}

bootstrap().catch((err) => {
  console.error('❌ Erro ao iniciar backend:', err);
  process.exit(1);
});
