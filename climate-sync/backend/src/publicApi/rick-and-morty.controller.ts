import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { RickAndMortyService } from './rick-and-morty.service';
import { RickAndMortyResponseDto } from './rick-and-morty.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Rick and Morty')
@Controller('rick-and-morty')
export class RickAndMortyController {
  constructor(private readonly service: RickAndMortyService) {}

  @ApiOperation({ summary: 'Listar personagens', description: 'Retorna personagens da API do Rick and Morty com paginação' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiResponse({ status: 200, description: 'Personagens retornados com sucesso' })
  @Get('characters')
  async getCharacters(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
  ): Promise<RickAndMortyResponseDto> {
    return this.service.getCharacters(page);
  }
}