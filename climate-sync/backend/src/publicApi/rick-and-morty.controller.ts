import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { RickAndMortyService } from './rick-and-morty.service';
import { RickAndMortyResponseDto } from './rick-and-morty.dto';

@Controller('rick-and-morty')
export class RickAndMortyController {
  constructor(private readonly service: RickAndMortyService) {}

  @Get('characters')
  async getCharacters(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ): Promise<RickAndMortyResponseDto> {
    return this.service.getCharacters(page);
  }
}