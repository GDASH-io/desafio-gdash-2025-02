import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  let mockConnection: any;

  beforeEach(async () => {
    mockConnection = {
      readyState: 1, // connected
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: getConnectionToken(),
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkHealth', () => {
    it('should return healthy status when MongoDB is connected', async () => {
      mockConnection.readyState = 1;

      const result = await service.checkHealth();

      expect(result).toHaveProperty('status', 'healthy');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(result.services.mongodb.status).toBe('connected');
      expect(result.services.api.status).toBe('running');
    });

    it('should return unhealthy status when MongoDB is disconnected', async () => {
      mockConnection.readyState = 0;

      const result = await service.checkHealth();

      expect(result).toHaveProperty('status', 'unhealthy');
      expect(result.services.mongodb.status).toBe('disconnected');
    });

    it('should include memory usage', async () => {
      const result = await service.checkHealth();

      expect(result).toHaveProperty('memory');
      expect(result.memory).toHaveProperty('rss');
      expect(result.memory).toHaveProperty('heapUsed');
      expect(result.memory).toHaveProperty('heapTotal');
    });
  });

  describe('checkReadiness', () => {
    it('should return ready when MongoDB is connected', async () => {
      mockConnection.readyState = 1;

      const result = await service.checkReadiness();

      expect(result.status).toBe('ready');
      expect(result.checks.mongodb).toBe(true);
    });

    it('should return not ready when MongoDB is disconnected', async () => {
      mockConnection.readyState = 0;

      const result = await service.checkReadiness();

      expect(result.status).toBe('not ready');
      expect(result.checks.mongodb).toBe(false);
    });
  });

  describe('checkLiveness', () => {
    it('should always return alive', async () => {
      const result = await service.checkLiveness();

      expect(result.status).toBe('alive');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });
});
