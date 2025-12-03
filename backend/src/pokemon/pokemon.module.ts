import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';

@Module({
  imports: [HttpModule],
  controllers: [PokemonController],
  providers: [PokemonService],
})
export class PokemonModule {}

