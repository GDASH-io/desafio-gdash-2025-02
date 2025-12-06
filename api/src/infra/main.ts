import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = new Logger("Bootstrap");

  const port = config.get<number>("PORT", 3000);

  app.enableCors();

  await app.listen(port);

  const server = app.getHttpServer();
  const router = server._events.request._router;

  if (router && router.stack) {
    const routes = router.stack
      .filter((r) => r.route)
      .map((r) => ({
        method: Object.keys(r.route.methods)[0].toUpperCase(),
        path: r.route.path,
      }));

    routes.forEach((route) => {
      console.log(`${route.method.padEnd(6)} ${route.path}`);
    });
  }

  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📊 Weather API: http://localhost:${port}/api/weather/logs`);
}

bootstrap();
