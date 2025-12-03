import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { GamesService } from './games.service';
import { LoggerService } from '../common/logger/logger.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import * as configModule from '../config/configuration';

// Mock do getConfig
jest.mock('../config/configuration', () => ({
  getConfig: jest.fn(() => ({
    RAWG_KEY: 'test-key',
  })),
}));

describe('GamesService', () => {
  let service: GamesService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    verbose: jest.fn(),
    formatMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamesService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<GamesService>(GamesService);
    httpService = module.get<HttpService>(HttpService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGames', () => {
    it('should return games list', async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: 'Test Game' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getGames(1, 20);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page');
    });

    it('should filter by platform', async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: 'Test Game' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      await service.getGames(1, 20, 187);

      expect(httpService.get).toHaveBeenCalled();
      const callArgs = mockHttpService.get.mock.calls[0][1];
      expect(callArgs.params.platforms).toBe(187);
    });

    it('should search games', async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: 'Test Game' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      await service.getGames(1, 20, undefined, 'test');

      expect(httpService.get).toHaveBeenCalled();
      const callArgs = mockHttpService.get.mock.calls[0][1];
      expect(callArgs.params.search).toBe('test');
    });

    it('should ignore empty search string', async () => {
      const mockResponse = {
        data: {
          results: [{ id: 1, name: 'Test Game' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      await service.getGames(1, 20, undefined, '   ');

      expect(httpService.get).toHaveBeenCalled();
      const callArgs = mockHttpService.get.mock.calls[0][1];
      expect(callArgs.params.search).toBeUndefined();
    });

    it('should throw error when API key is missing', async () => {
      jest.spyOn(configModule, 'getConfig').mockReturnValueOnce({
        RAWG_KEY: '',
      } as any);

      // Criar um novo módulo de teste com a configuração sem API key
      const testModule: TestingModule = await Test.createTestingModule({
        providers: [
          GamesService,
          {
            provide: HttpService,
            useValue: mockHttpService,
          },
          {
            provide: LoggerService,
            useValue: mockLoggerService,
          },
        ],
      }).compile();

      const newService = testModule.get<GamesService>(GamesService);

      await expect(newService.getGames(1, 20)).rejects.toThrow(HttpException);
    });

    it('should handle hasPreviousPage and hasNextPage in getGames', async () => {
      const mockResponse = {
        results: Array(20).fill(null).map((_, i) => ({
          id: i + 1,
          name: `Game ${i + 1}`,
          background_image: 'image.png',
          platforms: [],
          genres: [],
          rating: 4.5,
          released: '2025-01-01',
        })),
        count: 20,
      };
      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.getGames(1, 10);

      expect(result.hasPreviousPage).toBe(false);
      expect(result.hasNextPage).toBe(true);
    });

    it('should handle hasPreviousPage when page > 1 in getGames', async () => {
      const mockResponse = {
        data: {
          results: Array(20).fill(null).map((_, i) => ({
            id: i + 1,
            name: `Game ${i + 1}`,
            background_image: 'image.png',
            platforms: [],
            genres: [],
            rating: 4.5,
            released: '2025-01-01',
          })),
          count: 20,
        },
      };
      mockHttpService.get.mockReturnValue(of({ data: mockResponse }));

      const result = await service.getGames(2, 10);

      expect(result.hasPreviousPage).toBe(true);
    });

    it('should handle rate limit error (429)', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 429 } })),
      );

      await expect(service.getGames(1, 20)).rejects.toThrow(HttpException);
    });

    it('should handle generic error (not 429) in getGames', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getGames(1, 20)).rejects.toThrow(HttpException);
    });
  });

  describe('getGameById', () => {
    it('should return game by id', async () => {
      const mockGame = {
        id: 1,
        name: 'Test Game',
        description: '',
        released: '2025-01-01',
        rating: 4.5,
        platforms: [],
        genres: [],
        developers: [],
        publishers: [],
        screenshots: [],
      };
      mockHttpService.get.mockReturnValue(of({ data: mockGame }));

      const result = await service.getGameById(1);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 1);
      expect(result).toHaveProperty('name', 'Test Game');
    });

    it('should throw error when API key is missing', async () => {
      jest.spyOn(configModule, 'getConfig').mockReturnValueOnce({
        RAWG_KEY: '',
      } as any);

      // Criar um novo módulo de teste com a configuração sem API key
      const testModule: TestingModule = await Test.createTestingModule({
        providers: [
          GamesService,
          {
            provide: HttpService,
            useValue: mockHttpService,
          },
          {
            provide: LoggerService,
            useValue: mockLoggerService,
          },
        ],
      }).compile();

      const newService = testModule.get<GamesService>(GamesService);

      await expect(newService.getGameById(1)).rejects.toThrow(HttpException);
    });

    it('should handle game not found (404)', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 404 } })),
      );

      await expect(service.getGameById(99999)).rejects.toThrow(
        new HttpException('Jogo não encontrado', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle rate limit error (429)', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 429 } })),
      );

      await expect(service.getGameById(1)).rejects.toThrow(HttpException);
    });

    it('should handle generic error (not 429) in getGameById', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getGameById(1)).rejects.toThrow(HttpException);
    });

    it('should handle empty arrays in response', async () => {
      const mockGame = {
        id: 1,
        name: 'Test Game',
        description_raw: 'Description',
        description: 'Description',
        released: '2025-01-01',
        rating: 4.5,
        platforms: null,
        genres: null,
        developers: null,
        publishers: null,
        screenshots: null,
      };
      mockHttpService.get.mockReturnValue(of({ data: mockGame }));

      const result = await service.getGameById(1);

      expect(result).toHaveProperty('id', 1);
      expect(result.platforms).toEqual([]);
      expect(result.genres).toEqual([]);
    });

    it('should handle error when fetching screenshots', async () => {
      const mockGame = {
        id: 1,
        name: 'Test Game',
        description: 'Description',
        released: '2025-01-01',
        rating: 4.5,
        platforms: [],
        genres: [],
        developers: [],
        publishers: [],
      };
      mockHttpService.get
        .mockReturnValueOnce(of({ data: mockGame }))
        .mockReturnValueOnce(throwError(() => new Error('Screenshots error')));

      const result = await service.getGameById(1);

      expect(result).toHaveProperty('id', 1);
      expect(result.screenshots).toEqual([]);
    });

    it('should use description_raw when available', async () => {
      const mockGame = {
        id: 1,
        name: 'Test Game',
        description_raw: 'Raw Description',
        description: 'Regular Description',
        released: '2025-01-01',
        rating: 4.5,
        platforms: [],
        genres: [],
        developers: [],
        publishers: [],
      };
      mockHttpService.get.mockReturnValue(of({ data: mockGame }));

      const result = await service.getGameById(1);

      expect(result.description).toBe('Raw Description');
    });

    it('should use description when description_raw is not available', async () => {
      const mockGame = {
        id: 1,
        name: 'Test Game',
        description: 'Regular Description',
        released: '2025-01-01',
        rating: 4.5,
        platforms: [],
        genres: [],
        developers: [],
        publishers: [],
      };
      mockHttpService.get.mockReturnValue(of({ data: mockGame }));

      const result = await service.getGameById(1);

      expect(result.description).toBe('Regular Description');
    });

    it('should handle empty description', async () => {
      const mockGame = {
        id: 1,
        name: 'Test Game',
        released: '2025-01-01',
        rating: 4.5,
        platforms: [],
        genres: [],
        developers: [],
        publishers: [],
      };
      mockHttpService.get.mockReturnValue(of({ data: mockGame }));

      const result = await service.getGameById(1);

      expect(result.description).toBe('');
    });
  });

  describe('getAvailablePlatforms', () => {
    it('should return available platforms', () => {
      const platforms = service.getAvailablePlatforms();
      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms.length).toBe(4);
      expect(platforms.find((p) => p.name === 'PS5')).toBeDefined();
      expect(platforms.find((p) => p.name === 'Xbox')).toBeDefined();
      expect(platforms.find((p) => p.name === 'Switch')).toBeDefined();
      expect(platforms.find((p) => p.name === 'PC')).toBeDefined();
    });
  });
});

