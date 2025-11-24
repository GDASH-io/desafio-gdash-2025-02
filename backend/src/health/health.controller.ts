import { Controller, Get } from '@nestjs/common';
import { Public } from '../auth/guards/public.decorator';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  checkHealth() {
    return {
      status: 'ok',
    };
  }
}
