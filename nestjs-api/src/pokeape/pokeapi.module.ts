import { Module } from '@nestjs/common';
import { PokeapiService } from './pokeapi.service';
import { PokeAPIController } from './pokeapi.controller';

@Module({
  controllers: [PokeAPIController],
  providers: [PokeapiService],
  exports: [PokeapiService],
})
export class PokeapiModule {}