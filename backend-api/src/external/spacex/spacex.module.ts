import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SpacexService } from './spacex.service';
import { SpacexController } from './spacex.controller';

@Module({
  imports: [HttpModule],
  controllers: [SpacexController],
  providers: [SpacexService],
})
export class SpacexModule {}
