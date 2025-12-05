// spacex.controller.ts
import { Controller, Get, Query, Param } from '@nestjs/common';
import { SpacexService } from './spacex.service';

@Controller('/api/external/spacex')
export class SpacexController {
  constructor(private spacexService: SpacexService) {}

  @Get('launches')
  async getLaunches(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.spacexService.getLaunches(Number(page), Number(limit));
  }

  @Get('launches/:id')
  async getLaunchById(@Param('id') id: string) {
    return this.spacexService.getLaunchById(id);
  }
}
