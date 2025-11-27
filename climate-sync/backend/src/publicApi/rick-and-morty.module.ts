import { Module } from '@nestjs/common';
import { RickAndMortyController } from './rick-and-morty.controller';
import { RickAndMortyService } from './rick-and-morty.service';

@Module({
  controllers: [RickAndMortyController],
  providers: [RickAndMortyService],
})
export class RickAndMortyModule {}
