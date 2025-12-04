import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

describe('HealthController', () => {
  let controller: HealthController;
  let service: HealthService;

  const mockHealthService = {
    checkHealth: jest.fn(),
    checkReadiness: jest.fn(),
    checkLiveness: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: mockHealthService,
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    service = module.get<HealthService>(HealthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health status', async () => {
      const mockHealth = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: '100s',
        services: {
          mongodb: { status: 'connected', readyState: 1 },
          api: { status: 'running', version: '1.0.0' },
        },
        memory: { rss: '100MB', heapUsed: '50MB', heapTotal: '80MB' },
      };

      mockHealthService.checkHealth.mockResolvedValue(mockHealth);

      const result = await controller.check();

      expect(result).toEqual(mockHealth);
      expect(service.checkHealth).toHaveBeenCalledTimes(1);
    });
  });

  describe('ready', () => {
    it('should return readiness status', async () => {
      const mockReady = {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks: { mongodb: true },
      };

      mockHealthService.checkReadiness.mockResolvedValue(mockReady);

      const result = await controller.ready();

      expect(result).toEqual(mockReady);
      expect(service.checkReadiness).toHaveBeenCalledTimes(1);
    });
  });

  describe('live', () => {
    it('should return liveness status', async () => {
      const mockLive = {
        status: 'alive',
        timestamp: new Date().toISOString(),
        uptime: '100s',
      };

      mockHealthService.checkLiveness.mockResolvedValue(mockLive);

      const result = await controller.live();

      expect(result).toEqual(mockLive);
      expect(service.checkLiveness).toHaveBeenCalledTimes(1);
    });
  });
});
