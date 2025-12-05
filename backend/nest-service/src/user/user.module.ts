import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schema/user.schema";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import {JwtModule} from '@nestjs/jwt'

@Module({
  imports: [
    MongooseModule.forFeature([{
      name: User.name,
      schema: UserSchema
    }]),
    JwtModule
  ],
  controllers: [UserController],
  providers:[UserService],
  exports: [UserService]
})
export class UserModule {}