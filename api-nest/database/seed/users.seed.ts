import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../src/app.module';
import { IUserRepository } from '../../src/domain/repositories/user.repository';
import * as bcrypt from 'bcryptjs';

export async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userRepository = app.get<IUserRepository>('IUserRepository');

  const email = process.env.SEED_USER_EMAIL || 'admin@example.com';
  const password = process.env.SEED_USER_PASSWORD || '123456';
  const name = process.env.SEED_USER_NAME || 'Admin';
  const role = process.env.SEED_USER_ROLE || 'admin';

  try {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      console.log(`Usuário ${email} já existe. Pulando seed.`);
      await app.close();
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    console.log(`Usuário ${email} criado com sucesso!`);
  } catch (error) {
    console.error('Erro ao criar usuário seed:', error);
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  seed();
}
