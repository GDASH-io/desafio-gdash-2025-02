import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api')

  const port = process.env.PORT || 3000

  app.enableCors({
    origin: 'http://localhost:8080', 
    credentials: true,
  })

  await app.listen(port)
  console.log(`Application is running on port: ${port}`)
  console.log('Node environment:', process.env.NODE_ENV)
}

bootstrap()
