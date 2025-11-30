import { Module } from '@nestjs/common';
import { StarWarsService } from './star-wars.service';
import { StarWarsController } from './star-wars.controller';

@Module({
  controllers: [StarWarsController],
  providers: [StarWarsService],
})
export class StarWarsModule {}
