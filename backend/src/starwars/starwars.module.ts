import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { StarWarsController } from './starwars.controller';
import { StarWarsService } from './starwars.service';

@Module({
  imports: [HttpModule],
  controllers: [StarWarsController],
  providers: [StarWarsService],
})
export class StarWarsModule {}

