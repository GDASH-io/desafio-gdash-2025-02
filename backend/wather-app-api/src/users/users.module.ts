import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { CreateUsersRepository } from './repositories/create-users.repositorie';
import { CreateUsersService } from './services/create-users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Users, UsersSchema } from './schema/users.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Users.name, schema: UsersSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "WGJ60d6)5l3{",
      signOptions: {expiresIn: "1d"}
    }),
  ],
  controllers: [UsersController],
  providers: [CreateUsersRepository, CreateUsersService],
  exports: [CreateUsersRepository, CreateUsersService]
})
export class UsersModule {}
