import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { CreateUserService } from './features/create-user/create-user.service';
import { CreateUserController } from './features/create-user/create-user.controller';
import { FindUsersService } from './features/find-users/find-users.service';
import { FindUsersController } from './features/find-users/find-users.controller';
import { UpdateUserService } from './features/update-user/update-user.service';
import { UpdateUserController } from './features/update-user/update-user.controller';
import { DeleteUserService } from './features/delete-user/delete-user.service';
import { DeleteUserController } from './features/delete-user/delete-user.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [
    CreateUserController,
    FindUsersController,
    UpdateUserController,
    DeleteUserController,
  ],
  providers: [
    CreateUserService,
    FindUsersService,
    UpdateUserService,
    DeleteUserService,
  ],
  exports: [FindUsersService, CreateUserService],
})
export class UsersModule {}
