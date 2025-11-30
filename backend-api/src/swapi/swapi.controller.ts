import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { SwapiService } from './swapi.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('swapi')
@UseGuards(AuthGuard('jwt'))
export class SwapiController {
  constructor(private readonly swapiService: SwapiService) {}
  @Get(':resource')
  findAll(@Param('resource') resource: string, @Query('page') page: number) {
    return this.swapiService.getResource(resource, page);
  }

  @Get(':resource/:id')
  findOne(@Param('resource') resource: string, @Param('id') id: string) {
    return this.swapiService.getResourceById(resource, id);
  }
}