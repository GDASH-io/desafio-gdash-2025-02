import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { ListUsersUseCase } from "@/domain/application/use-cases/list-users.use-case";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { listUsersQuerySchema } from "../schemas/user.schema";
import { UserPresenter } from "../presenters/user.presenter";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller("/users")
@UseGuards(JwtAuthGuard)
export class ListUsersController {
  constructor(private listUsers: ListUsersUseCase) {}

  @Get()
  async list(@Query(new ZodValidationPipe(listUsersQuerySchema)) query: any) {
    const result = await this.listUsers.execute(query);
    const { users, total, page, limit, totalPages } = result.value;

    return {
      data: users.map(UserPresenter.toHTTP),
      pagination: { total, page, limit, totalPages },
    };
  }
}
