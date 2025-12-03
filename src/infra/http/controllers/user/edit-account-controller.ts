import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipe/zod-validation-pipe';
import { CredentialAlreadyExistError } from '@/core/errors/credential-already-exist-error';
import { EditUserUseCase } from '@/domain/aplication/use-case/user/edit-user-use-case';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayloadSchema } from '@/infra/auth/jwt-strategy';

const editAccountBodySchema = z.object({
  name: z.string(),
  userName: z.string(),
  email: z.email(),
  password: z.string(),
});

type EditAccountBodySchema = z.infer<typeof editAccountBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(editAccountBodySchema);
@Controller('/edit/account')
@UseGuards(AuthGuard('jwt'))
export class EditAccountController {
  constructor(private editUserUseCase: EditUserUseCase) {}
  @Post()
  @HttpCode(201)
  async handle(
    @Body(bodyValidationPipe) body: EditAccountBodySchema,
    @CurrentUser() user: TokenPayloadSchema,
  ) {
    const { sub } = user;
    const { name, userName, email, password } = body;

    const result = await this.editUserUseCase.execute({
      id: sub,
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
