import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { IsPublic } from './common/decorators/IsPublic';

@IsPublic()
@Controller()
export class AppController {
  @HttpCode(HttpStatus.OK)
  @Get('health')
  healthy() {
    return {
      status: 'ok',
    };
  }
}
