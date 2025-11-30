import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ExplorerService } from './explorer.service';

@Controller('explorer')
export class ExplorerController {
  constructor(private readonly explorerService: ExplorerService) {}

  @HttpCode(HttpStatus.OK)
  @Get('star-wars')
  findAll(@Query('page', ParseIntPipe) page: number) {
    return this.explorerService.findAll(page);
  }
}
