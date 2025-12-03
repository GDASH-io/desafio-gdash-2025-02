import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipe/zod-validation-pipe';
import { CredentialAlreadyExistError } from '@/core/errors/credential-already-exist-error';
import { AuthenticateUserUseCase } from '@/domain/aplication/use-case/user/authenticate-use-case';

const authenticateBodySchema = z.object({
  email: z.email(),
  password: z.string(),
});

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(authenticateBodySchema);
@Controller('/authenticate')
export class AuthenticateController {
  constructor(private authenticateUseCase: AuthenticateUserUseCase) {}
  @Post()
  @HttpCode(200)
  async handle(@Body(bodyValidationPipe) body: AuthenticateBodySchema) {
    const { email, password } = body;

    const result = await this.authenticateUseCase.execute({
      email,
      password,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case CredentialAlreadyExistError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { access_token } = result.value;

    return {
      access_token,
    };
  }
}
