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
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayloadSchema } from '@/infra/auth/jwt-strategy';
import { ReportClimateUseCase } from '@/domain/aplication/use-case/climate/report-climate-use-case';

const reportAIClimateParamsSchema = z.object({
  page: z.coerce.number().int().min(1),
});

type ReportAIClimateParamsSchema = z.infer<typeof reportAIClimateParamsSchema>;

const paramsValidationPipe = new ZodValidationPipe(reportAIClimateParamsSchema);
@Controller('/get/:page/report/AI/climate')
@UseGuards(AuthGuard('jwt'))
export class ReportAIClimateController {
  constructor(private reportAIClimateUseCase: ReportClimateUseCase) {}
  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser()
    user: TokenPayloadSchema,
    @Param(paramsValidationPipe) params: ReportAIClimateParamsSchema,
  ) {
    const { sub } = user;
    const { page } = params;
    const result = await this.reportAIClimateUseCase.execute({ id: sub, page });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    const { report } = result.value;
    return {
      report,
    };
  }
}
