import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
    const logger = new Logger('Bootstrap');

    const app = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    const configService = app.get(ConfigService)

    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
        allowedHeaders: 'Content-Type, Accept, Authorization'
    });

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

    const config = new DocumentBuilder()
        .setTitle('GDASH Weather API')
        .setDescription('API para gerenciamento e dados climático com IA')
        .setVersion('1.0')
        .addTag('auth', 'Autenticação e registro de usuários')
        .addTag('users', 'Gerenciamento de usuários')
        .addTag('weather', 'Logs climáticos')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT Token',
                in: 'header'
            },
            'JWT-auth',
        )
        .addServer('http://localhost:3000')
        .build()

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
            tagsSorter: 'alpha',
            operationSorter: 'alpha',
        },
        customSiteTitle: 'GDASH Weather API Documentation',
    });

    app.getHttpAdapter().get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port, '0.0.0.0');

    logger.log('========================================');
    logger.log(`GDASH API is running on port ${port}`);
    logger.log(`Health check: http://localhost:${port}/health`);
    logger.log(`Swagger Docs: http://localhost:${port}/api/docs`);
    logger.log(`Auth endpoints: http://localhost:${port}/api/v1/auth`);
    logger.log(`Users endpoints: http://localhost:${port}/api/v1/users`);
    logger.log(`Weather endpoints: http://localhost:${port}/api/v1/weather`);
    logger.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`AI Insights: ${configService.get('ai.enabled') ? 'Enabled' : 'Disabled'}`);
    logger.log('========================================');
}

bootstrap();