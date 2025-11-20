import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { UserService } from './users/user.service';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); 
  app.setGlobalPrefix('api'); 
  app.useGlobalPipes(new ValidationPipe());

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
      console.log('Default admin user created.');
    } else {
      console.log('Default admin user already exists.');
    }
  }

  await app.listen(3000);
}
bootstrap();
