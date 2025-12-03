import {
  BadRequestException,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../../pipe/zod-validation-pipe';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '@/infra/auth/current-user-decorator';
import { TokenPayloadSchema } from '@/infra/auth/jwt-strategy';
import { ExportCSVUseCase } from '@/domain/aplication/use-case/climate/export-climate-csv-use-case';
import { Response } from 'express';

const exportClimateParamsSchema = z.object({
  page: z.coerce.number().int().min(1),
});

type ExportClimateParamsSchema = z.infer<typeof exportClimateParamsSchema>;

const paramsValidationPipe = new ZodValidationPipe(exportClimateParamsSchema);
@Controller('/get/:page/climate/weather/export/csv')
@UseGuards(AuthGuard('jwt'))
export class ExportClimateController {
  constructor(private exportClimateUseCase: ExportCSVUseCase) {}
  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser()
    user: TokenPayloadSchema,
    @Param(paramsValidationPipe) params: ExportClimateParamsSchema,
    @Res() res: Response,
  ) {
    const { sub } = user;
    const { page } = params;

    const result = await this.exportClimateUseCase.execute({
      id: sub,
      page,
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

    const { csv } = result.value;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=climate.csv');

    return res.send(csv);
  }
}
