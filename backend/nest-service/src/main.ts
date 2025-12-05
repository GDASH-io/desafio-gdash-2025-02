import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:4000",

      ],
      methods: ["GET", "POST", "PATCH", "DELETE"],
      credentials: true,
    }
  });

  app.setGlobalPrefix("api/v1");
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
