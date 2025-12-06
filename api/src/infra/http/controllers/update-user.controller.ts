import {
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import { UpdateUserUseCase } from "@/domain/application/use-cases/update-user.use-case";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { updateUserSchema } from "../schemas/user.schema";
import { UserPresenter } from "../presenters/user.presenter";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller("/users")
@UseGuards(JwtAuthGuard)
export class UpdateUserController {
  constructor(private updateUser: UpdateUserUseCase) {}

  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) body: any
  ) {
    const result = await this.updateUser.execute({ userId: id, ...body });

    if (result.isLeft()) {
      const error = result.value;
      if (error.message.includes("not found")) {
        throw new NotFoundException(error.message);
      }
      throw new ConflictException(error.message);
    }

    return {
      message: "User updated successfully",
      data: UserPresenter.toHTTP(result.value.user),
    };
  }
}
