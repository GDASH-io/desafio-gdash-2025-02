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
import { CreateClimateUseCase } from '@/domain/aplication/use-case/climate/create-climate-use-case';
import { CredentialAlreadyExistError } from '@/core/errors/credential-already-exist-error';

const createClimateBodySchema = z.object({
  timeStamp: z.coerce.date(),
  temperature: z.number(),
  windSpeed: z.number(),
  windDirection: z.string(),
  weatherCode: z.string(),
});

type CreateClimateBodySchema = z.infer<typeof createClimateBodySchema>;

const bodyValidationPipe = new ZodValidationPipe(createClimateBodySchema);
@Controller('/climate')
export class CreateClimateController {
  constructor(private createClimateUseCase: CreateClimateUseCase) {}
  @Post()
  @HttpCode(201)
  async handle(@Body(bodyValidationPipe) body: CreateClimateBodySchema) {
    const { timeStamp, temperature, windSpeed, windDirection, weatherCode } =
      body;

    const result = await this.createClimateUseCase.execute({
      timeStamp,
      temperature,
      windSpeed,
      windDirection,
      weatherCode,
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
