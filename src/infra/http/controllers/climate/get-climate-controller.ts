import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Param,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipe/zod-validation-pipe';
import { GetClimateUseCase } from '@/domain/aplication/use-case/climate/get-climate-use-case';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayloadSchema } from '@/infra/auth/jwt-strategy';

const getClimateParamsSchema = z.object({
  page: z.coerce.number().int().min(1),
});

type GetClimateParamsSchema = z.infer<typeof getClimateParamsSchema>;

const paramsValidationPipe = new ZodValidationPipe(getClimateParamsSchema);
@Controller('/get/:page/climate')
@UseGuards(AuthGuard('jwt'))
export class GetClimateController {
  constructor(private getClimateUseCase: GetClimateUseCase) {}
  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser()
    user: TokenPayloadSchema,
    @Param(paramsValidationPipe) params: GetClimateParamsSchema,
  ) {
    const { sub } = user;
    const { page } = params;

    const result = await this.getClimateUseCase.execute({ id: sub, page });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    const { climate } = result.value;
    return {
      climate,
    };
  }
}
