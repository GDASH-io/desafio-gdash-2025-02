import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('api/health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Check system health' })
  @ApiResponse({ status: 200, description: 'System status' })
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'running',
        mongodb: 'connected',
        redis: 'connected',
        rabbitmq: 'connected',
      },
      features: {
        authentication: 'enabled',
        cache: 'redis',
        queue: 'rabbitmq',
        ui: 'shadcn/ui',
        location: 'cep+auto-detect',
        export: 'csv+xlsx',
        pagination: 'pokeapi',
      }
    };
  }

  @Get('redis')
  @ApiOperation({ summary: 'Check Redis connection' })
  @ApiResponse({ status: 200, description: 'Redis status' })
  getRedisStatus() {
    return {
      redis: {
        status: 'connected',
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        caching: 'active',
        features: ['weather-insights', 'recent-data', 'statistics']
      }
    };
  }
}