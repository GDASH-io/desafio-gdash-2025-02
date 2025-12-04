import { forwardRef, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./infrastructure/schemas/user.schema";
import { AuthModule } from "../auth/auth.module";
import { UsersController } from "./presentation/users.controller";
import { UserRepository } from "./infrastructure/repositories/user.repository";
import { CreateUserUseCase } from "./application/use-cases/create-user.use-case";
import { DeleteUserUseCase } from "./application/use-cases/delete-user.use-case";
import { ListUsersUseCase } from "./application/use-cases/list-users.use-case";
import { UpdateUserUseCase } from "./application/use-cases/update-user.use-case";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        forwardRef(() => AuthModule),
    ],
    controllers: [UsersController],
    providers: [
        UserRepository,
        CreateUserUseCase,
        ListUsersUseCase,
        UpdateUserUseCase,
        DeleteUserUseCase,
    ],
    exports: [UserRepository],
})
export class UsersModule {}