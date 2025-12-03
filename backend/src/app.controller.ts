import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiResponse({ status: 200, description: 'Aplicação está funcionando' })
  getHealth() {
    console.log('[backend] GET /health');
    return { status: 'ok' };
  }
}

