import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class HealthService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async checkHealth() {
    const mongoStatus = this.getMongoStatus();
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    return {
      status: mongoStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime)}s`,
      services: {
        mongodb: {
          status: mongoStatus,
          readyState: this.connection.readyState,
        },
        api: {
          status: 'running',
          version: '1.0.0',
        },
      },
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`,
      },
    };
  }

  async checkReadiness() {
    const mongoStatus = this.getMongoStatus();
    const isReady = mongoStatus === 'connected';

    return {
      status: isReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        mongodb: mongoStatus === 'connected',
      },
    };
  }

  async checkLiveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(process.uptime())}s`,
    };
  }

  private getMongoStatus(): string {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    return states[this.connection.readyState] || 'unknown';
  }
}
