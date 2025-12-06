import {
  Controller,
  Get,
  Param,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { GetUserByIdUseCase } from "@/domain/application/use-cases/get-user-by-id.use-case";
import { UserPresenter } from "../presenters/user.presenter";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller("/users")
@UseGuards(JwtAuthGuard)
export class GetUserByIdController {
  constructor(private getUserById: GetUserByIdUseCase) {}

  @Get(":id")
  async getById(@Param("id") id: string) {
    const result = await this.getUserById.execute({ userId: id });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return {
      data: UserPresenter.toHTTP(result.value.user),
    };
  }
}
