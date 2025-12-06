import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthenticateUserUseCase } from "@/domain/application/use-cases/authenticate-user.use-case";
import { ZodValidationPipe } from "../pipes/zod-validation.pipe";
import { LoginSchema, loginSchema } from "../schemas/auth.schema";

@Controller("/auth")
export class AuthController {
  constructor(private authenticateUser: AuthenticateUserUseCase) {}

  @Post("/login")
  async login(@Body(new ZodValidationPipe(loginSchema)) body: LoginSchema) {
    const { email, password } = body;

    const result = await this.authenticateUser.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      throw new UnauthorizedException(result.value.message);
    }

    const { accessToken, user } = result.value;

    return {
      message: "Login successful",
      data: {
        accessToken,
        user,
      },
    };
  }
}
