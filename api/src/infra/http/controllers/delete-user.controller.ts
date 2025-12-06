import {
  Controller,
  Delete,
  Param,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { DeleteUserUseCase } from "@/domain/application/use-cases/delete-user.use-case";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller("/users")
@UseGuards(JwtAuthGuard)
export class DeleteUserController {
  constructor(private deleteUser: DeleteUserUseCase) {}

  @Delete(":id")
  async delete(@Param("id") id: string) {
    const result = await this.deleteUser.execute({ userId: id });

    if (result.isLeft()) {
      throw new NotFoundException(result.value.message);
    }

    return {
      message: "User deleted successfully",
    };
  }
}
