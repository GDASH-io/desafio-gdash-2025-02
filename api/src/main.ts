import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UsersService } from "./services/users.service";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    app.enableCors();

    // ValidationPipe global
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,            // Remove propriedades não declaradas nos DTOs
    forbidNonWhitelisted: true, // Rejeita requisições com props extras
    transform: true,            // Converte tipos para os esperados no DTO
  }));

  // Criação automática de usuário admin na inicialização
    const usersService = app.get(UsersService);
    const isUser = await usersService.findByEmail(process.env.ADMIN_EMAIL || '');
    if (!isUser) {
        const user = {
        email: process.env.ADMIN_EMAIL || '',
        password: process.env.ADMIN_PASSWORD || '',
        role: 'admin',
    }

        await usersService.create(user);
    }

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();