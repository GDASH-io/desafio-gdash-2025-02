import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SpacexService } from './spacex.service';

@Controller('spacex')
@UseGuards(AuthGuard('jwt'))
export class SpacexController {
  constructor(private readonly service: SpacexService) {}

  @Get('launches')
  findAll(@Query('page') page: string, @Query('limit') limit: string) {
    return this.service.findAll(+page || 1, +limit || 10);
  }
}
