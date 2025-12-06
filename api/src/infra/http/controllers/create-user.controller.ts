import {
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CreateUserUseCase } from "@/domain/application/use-cases/create-user.use-case";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { createUserSchema } from "../schemas/user.schema";
import { UserPresenter } from "../presenters/user.presenter";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller("/users")
@UseGuards(JwtAuthGuard)
export class CreateUserController {
  constructor(private createUser: CreateUserUseCase) {}

  @Post()
  async create(@Body(new ZodValidationPipe(createUserSchema)) body: any) {
    const result = await this.createUser.execute(body);

    if (result.isLeft()) {
      throw new ConflictException(result.value.message);
    }

    const { user } = result.value;

    return {
      message: "User created successfully",
      data: UserPresenter.toHTTP(user),
    };
  }
}
