import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule implements OnModuleInit {
  constructor(private usersService: UsersService) {}

  async onModuleInit() {
    const defaultUser =
      await this.usersService.findByEmail('admin@example.com');
    if (!defaultUser) {
      await this.usersService.create({
        email: 'admin@example.com',
        password: '123456',
        name: 'Administrador',
      });
      console.log('✅ Usuário padrão criado: admin@example.com / 123456');
    }
  }
}
