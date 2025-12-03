import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
  imports: [HttpModule],
  controllers: [GamesController],
  providers: [GamesService],
})
export class GamesModule {}

