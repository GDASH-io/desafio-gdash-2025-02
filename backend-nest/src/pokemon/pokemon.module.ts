import { Module } from '@nestjs/common';
import { PokemonController } from './pokemon.controller';

@Module({
  controllers: [PokemonController],
})
export class PokemonModule {}
