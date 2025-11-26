import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../../domain/entities/user.entity';
import { UserRepositoryImpl } from '../../infra/database/repositories/user.repository.impl';
import { IUserRepository } from '../../domain/repositories/user.repository';
import { CreateUserUseCase } from '../../application/usecases/users/create-user.use-case';
import { GetUsersUseCase } from '../../application/usecases/users/get-users.use-case';
import { GetUserUseCase } from '../../application/usecases/users/get-user.use-case';
import { UpdateUserUseCase } from '../../application/usecases/users/update-user.use-case';
import { DeleteUserUseCase } from '../../application/usecases/users/delete-user.use-case';
import { UsersController } from '../../presentation/controllers/users.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    AuthModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: UserRepositoryImpl,
    },
    CreateUserUseCase,
    GetUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
})
export class UsersModule {}

