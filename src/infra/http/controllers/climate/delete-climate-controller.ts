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
import { DeleteClimateUseCase } from '@/domain/aplication/use-case/climate/delete-climate-use-case';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

const deleteClimateBodySchema = z.object({
  id: z.string(),
});

type DeleteClimateBodySchema = z.infer<typeof deleteClimateBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(deleteClimateBodySchema);
@Controller('/delete/climate')
export class DeleteClimateController {
  constructor(private deleteClimateUseCase: DeleteClimateUseCase) {}
  @Post()
  @HttpCode(204)
  async handle(@Body(bodyValidationPipe) body: DeleteClimateBodySchema) {
    const { id } = body;

    const result = await this.deleteClimateUseCase.execute({ id });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
  }
}
