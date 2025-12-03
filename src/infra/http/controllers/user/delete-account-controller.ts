import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipe/zod-validation-pipe';
import { CredentialAlreadyExistError } from '@/core/errors/credential-already-exist-error';
import { DeleteUserUseCase } from '@/domain/aplication/use-case/user/delete-user-use-case';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayloadSchema } from '@/infra/auth/jwt-strategy';
import { AuthGuard } from '@nestjs/passport';

const deleteAccountBodySchema = z.object({
  email: z.email(),
});

type DeleteAccountBodySchema = z.infer<typeof deleteAccountBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(deleteAccountBodySchema);
@Controller('/delete/account')
@UseGuards(AuthGuard('jwt'))
export class DeleteAccountController {
  constructor(private deleteAccountUseCase: DeleteUserUseCase) {}
  @Post()
  @HttpCode(204)
  async handle(
    @Body(bodyValidationPipe) body: DeleteAccountBodySchema,
    @CurrentUser() user: TokenPayloadSchema,
  ) {
    const { sub } = user;
    const { email } = body;

    const result = await this.deleteAccountUseCase.execute({
      id: sub,
      email,
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
