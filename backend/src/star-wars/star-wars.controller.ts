import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { StarWarsService } from './star-wars.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Star Wars (Naves)')
@Controller('star-wars')
export class StarWarsController {
  constructor(private readonly starWarsService: StarWarsService) {}
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('starships') // Rota: /api/v1/swapi/starships
  @ApiOperation({ summary: 'Lista as naves de Star Wars (Paginado)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  findAll(@Query('page') page: string) {
    return this.starWarsService.findAll(Number(page) || 1);
  }
  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('starships/:id') // Rota: /api/v1/swapi/starships/9
  @ApiOperation({ summary: 'Busca detalhes de uma nave pelo ID' })
  findOne(@Param('id') id: string) {
    return this.starWarsService.findOne(Number(id));
  }
}
