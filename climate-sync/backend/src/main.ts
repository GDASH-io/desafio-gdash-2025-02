import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  const port = process.env.PORT || 3000

  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost'],
    credentials: true,
  })

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('Climate Sync API')
    .setDescription('API para monitoramento climático com integração de IA e dados em tempo real')
    .setVersion('1.0')
    .addTag('Auth', 'Autenticação e gerenciamento de sessões')
    .addTag('Weather', 'Dados climáticos e insights de IA')
    .addTag('Users', 'Gerenciamento de usuários')
    .addTag('Dashboard', 'Métricas e estatísticas do dashboard')
    .addTag('Analytics', 'Análises e relatórios')
    .addTag('Rick and Morty', 'Integração com API pública do Rick and Morty')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(port)
  console.log(`Application is running on port: ${port}`)
  console.log(`Swagger documentation available at: http://localhost:${port}/api/docs`)
  console.log('Node environment:', process.env.NODE_ENV)
}

bootstrap()
