import { Controller, Get } from '@nestjs/common';
import { Public } from '../../infra/auth/public.decorator';

@Controller()
export class AppController {
  @Get()
  @Public()
  getRoot() {
    return {
      name: 'GDASH API',
      version: '1.0.0',
      description: 'API para sistema de monitoramento climático e energia solar',
      endpoints: {
        health: '/api/v1/weather/health',
        auth: {
          login: '/api/v1/auth/login',
          register: '/api/v1/auth/register',
        },
        weather: {
          logs: '/api/v1/weather/logs',
          latest: '/api/v1/weather/logs/latest',
          precipitation24h: '/api/v1/weather/precipitation/24h',
          insights: '/api/v1/weather/insights',
          export: {
            csv: '/api/v1/weather/export.csv',
            xlsx: '/api/v1/weather/export.xlsx',
          },
        },
        users: '/api/v1/users',
      },
    };
  }

  @Get('api/v1')
  @Public()
  getApiRoot() {
    return this.getRoot();
  }
}

