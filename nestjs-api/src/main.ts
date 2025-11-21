import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UserService } from './users/user.service';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('API de Coleta de Dados Climáticos')
    .setDescription('Documentação da API para coleta e gerenciamento de dados climáticos.')
    .setVersion('1.0')
    .addTag('clima')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const userService = app.get(UserService);
  const configService = app.get(ConfigService);

  const defaultAdminEmail = configService.get<string>('DEFAULT_ADMIN_EMAIL');
  const defaultAdminPassword = configService.get<string>('DEFAULT_ADMIN_PASSWORD');

  if (defaultAdminEmail && defaultAdminPassword) {
    const adminUser = await userService.findByEmail(defaultAdminEmail);
    if (!adminUser) {
      await userService.create({
        email: defaultAdminEmail,
        password: defaultAdminPassword,
        roles: 'admin',
      });
      console.log('Usuário administrador padrão criado.');
    } else {
      console.log('Usuário administrador padrão já existe.');
    }
  }

  await app.listen(3000);
}
bootstrap();
