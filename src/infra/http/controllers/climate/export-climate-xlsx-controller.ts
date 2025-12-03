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
import { ExportXLSXUseCase } from '@/domain/aplication/use-case/climate/export-climate-xlsx-use-case';

const exportClimateXLSXParamsSchema = z.object({
  page: z.coerce.number().int().min(1),
});

type ExportClimateXLSXParamsSchema = z.infer<
  typeof exportClimateXLSXParamsSchema
>;

const paramsValidationPipe = new ZodValidationPipe(
  exportClimateXLSXParamsSchema,
);
@Controller('/get/:page/climate/weather/export/xlsx')
@UseGuards(AuthGuard('jwt'))
export class ExportClimateXLSXController {
  constructor(private exportClimateXLSXUseCase: ExportXLSXUseCase) {}
  @Get()
  @HttpCode(200)
  async handle(
    @CurrentUser()
    user: TokenPayloadSchema,
    @Param(paramsValidationPipe) params: ExportClimateXLSXParamsSchema,
    @Res() res: Response,
  ) {
    const { sub } = user;
    const { page } = params;

    const result = await this.exportClimateXLSXUseCase.execute({
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

    const { xlsx } = result.value;

    res.setHeader('Content-Type', 'text/xlsx');
    res.setHeader('Content-Disposition', 'attachment; filename=climate.xlsx');

    return res.send(xlsx);
  }
}
