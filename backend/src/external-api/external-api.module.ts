import { Module } from '@nestjs/common';
import { ExternalApiService } from './external-api.service';
import { ExternalApiController } from './external-api.controller';

@Module({
  providers: [ExternalApiService],
  controllers: [ExternalApiController]
})
export class ExternalApiModule {}
