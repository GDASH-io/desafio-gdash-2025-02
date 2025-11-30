import { Module } from '@nestjs/common';
import { SwapiController } from './swapi.controller';
import { SwapiService } from './swapi.service';

@Module({
  controllers: [SwapiController],
  providers: [SwapiService]
})
export class SwapiModule {}
