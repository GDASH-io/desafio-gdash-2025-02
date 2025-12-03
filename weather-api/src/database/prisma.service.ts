import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await this.seedDefaultUser();
  }
  private async seedDefaultUser() {
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL;
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD;

    const userExists = await this.user.findUnique({
      where: { email: defaultEmail },
    });

    if (userExists) {
      console.log('User already exists:', userExists.email);
      return;
    }

    const hashedPassword = await hash(defaultPassword, 12);

    const createdUser = await this.user.create({
      data: {
        name: 'ADMIN',
        email: defaultEmail,
        password: hashedPassword,
      },
    });

    console.log('🌱 Default admin user created:', createdUser.email);
  }
}
