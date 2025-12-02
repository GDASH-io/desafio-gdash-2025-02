import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const email = 'admin@gdash.com';
  const password = '123456';

  const exists = await usersService.findByEmail(email);
  if (!exists) {
    const hashed = await bcrypt.hash(password, 10);

    await usersService.create({
      email,
      password: hashed,
      role: 'admin'
    });

    console.log('Usuário admin criado!');
  } else {
    console.log('Admin já existe.');
  }

  await app.close();
}
seed();
