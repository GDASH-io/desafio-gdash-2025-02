import { Module } from '@nestjs/common';
import { SpacexController } from './spacex.controller';
import { SpacexService } from './spacex.service';

@Module({
  controllers: [SpacexController],
  providers: [SpacexService]
})
export class SpacexModule {}
