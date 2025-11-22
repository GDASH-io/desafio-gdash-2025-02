import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { SwapiService } from './swapi.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('swapi')
@UseGuards(AuthGuard('jwt'))
export class SwapiController {
  constructor(private readonly swapiService: SwapiService) {}

  @Get('planets')
  findAll(@Query('page') page: number) {
    return this.swapiService.getPlanets(page);
  }

  @Get('planets/:id')
  findOne(@Param('id') id: string) {
    return this.swapiService.getPlanetById(id);
  }
}