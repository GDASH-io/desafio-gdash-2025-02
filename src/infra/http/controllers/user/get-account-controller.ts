import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import { GetUserUseCase } from '@/domain/aplication/use-case/user/get-user-use-case';
import { CredentialAlreadyExistError } from '@/core/errors/credential-already-exist-error';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayloadSchema } from '@/infra/auth/jwt-strategy';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { UserPresenter } from '../../presenter/user-presenter';

@Controller('/get/account')
@UseGuards(AuthGuard('jwt'))
export class GetAccountController {
  constructor(private getUserUseCase: GetUserUseCase) {}
  @Get()
  @HttpCode(200)
  async handle(@CurrentUser() account: TokenPayloadSchema) {
    const result = await this.getUserUseCase.execute({
      id: account.sub,
    });
    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    const { user } = result.value;
    const userPresenter = UserPresenter.toHTTP(user);
    return { userPresenter };
  }
}
