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
import { CreateUserUseCase } from '@/domain/aplication/use-case/user/create-user-use-case';
import { CredentialAlreadyExistError } from '@/core/errors/credential-already-exist-error';

const createAccountBodySchema = z.object({
  name: z.string(),
  userName: z.string(),
  email: z.email(),
  password: z.string(),
});

type CreateAccountBodySchema = z.infer<typeof createAccountBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createAccountBodySchema);
@Controller('/account')
export class CreateAccountController {
  constructor(private createUserUseCase: CreateUserUseCase) {}
  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: CreateAccountBodySchema) {
    const { name, userName, email, password } = body;

    const result = await this.createUserUseCase.execute({
      name,
      userName,
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
  }
}
