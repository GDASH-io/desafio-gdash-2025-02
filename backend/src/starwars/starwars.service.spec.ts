import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { StarWarsService } from './starwars.service';
import { LoggerService } from '../common/logger/logger.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('StarWarsService', () => {
  let service: StarWarsService;
  let httpService: HttpService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockLoggerService = {
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StarWarsService,
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

    service = module.get<StarWarsService>(StarWarsService);
    httpService = module.get<HttpService>(HttpService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPeople', () => {
    it('should return people list without search', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Luke Skywalker', height: '172' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPeople(1, 10);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
    });

    it('should return people list with search', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Luke Skywalker', height: '172' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPeople(1, 10, 'luke');

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
    });

    it('should ignore empty search string', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Luke Skywalker', height: '172' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPeople(1, 10, '   ');

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
    });

    it('should handle undefined search parameter', async () => {
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 10,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPeople(1, 10, undefined);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(10);
    });

    it('should handle rate limit error (429)', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 429 } })),
      );

      await expect(service.getPeople(1, 10)).rejects.toThrow(HttpException);
      await expect(service.getPeople(1, 10)).rejects.toThrow(
        'Muitas requisições',
      );
    });

    it('should handle generic error', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getPeople(1, 10)).rejects.toThrow(HttpException);
    });

    it('should handle null count in response', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Luke Skywalker', height: '172' }],
          count: null,
        },
      };
      const mockFirstPageResponse = {
        data: {
          results: [{ name: 'Luke Skywalker', height: '172' }],
          count: 1,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse))
        .mockReturnValueOnce(of(mockFirstPageResponse));

      const result = await service.getPeople(1, 10);

      expect(result).toHaveProperty('data');
      expect(result.total).toBe(1);
    });

    it('should handle pagination across multiple SWAPI pages (same page)', async () => {
      // Teste para quando swapiPage === swapiPageStart === swapiPageEnd
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 10,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPeople(1, 5);

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(5);
    });

    it('should handle pagination across multiple SWAPI pages (first page)', async () => {
      // Teste para quando swapiPage === swapiPageStart (primeira página)
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 11}`,
            height: '172',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      // Página 1, limit 15 (precisa de 2 páginas SWAPI)
      const result = await service.getPeople(1, 15);

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(15);
    });

    it('should handle pagination across multiple SWAPI pages (last page)', async () => {
      // Teste para quando swapiPage === swapiPageEnd (última página)
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 11}`,
            height: '172',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      // Página 2, limit 15 (offset 15, precisa de 2 páginas SWAPI)
      const result = await service.getPeople(2, 15);

      expect(result).toHaveProperty('data');
    });

    it('should handle pagination with endIndex calculation when (offset + limit) % 10 === 0', async () => {
      // Teste para quando (offset + limit) % 10 === 0, então endIndex deve ser 10
      // Exemplo: offset=10, limit=10 -> (10+10) % 10 = 0, então endIndex = 10
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 11}`,
            height: '172',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      // Página 2, limit 10 (offset 10, precisa de 2 páginas SWAPI, endIndex = 10)
      const result = await service.getPeople(2, 10);

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(10);
    });

    it('should handle pagination with endIndex calculation when (offset + limit) % 10 !== 0', async () => {
      // Teste para quando (offset + limit) % 10 !== 0
      // Exemplo: offset=5, limit=8 -> (5+8) % 10 = 3, então endIndex = 3
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 11}`,
            height: '172',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      // Página 1, limit 8 (offset 0, mas vamos pegar até o índice 8 na segunda página)
      // Na verdade, vamos testar página 2 com offset 5 e limit 8
      const result = await service.getPeople(2, 8);

      expect(result).toHaveProperty('data');
    });

    it('should set hasPreviousPage to false when page is 1', async () => {
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 10,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPeople(1, 10);

      // Quando page é 1, hasPreviousPage deve ser false
      expect(result.hasPreviousPage).toBe(false);
    });

    it('should set hasNextPage to false when page equals totalPages', async () => {
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 10,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPeople(1, 10);

      expect(result.hasNextPage).toBe(false);
    });

    it('should set hasPreviousPage to true when page > 1', async () => {
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 11}`,
            height: '172',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      const result = await service.getPeople(2, 10);

      expect(result.hasPreviousPage).toBe(true);
    });

    it('should set hasNextPage to true when page < totalPages', async () => {
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 30,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPeople(1, 10);

      expect(result.hasNextPage).toBe(true);
    });

    it('should handle pagination across multiple SWAPI pages (intermediate pages)', async () => {
      // Teste para páginas intermediárias
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 1}`,
            height: '172',
          })),
          count: 30,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 11}`,
            height: '172',
          })),
          count: 30,
        },
      };
      const mockResponse3 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Person ${i + 21}`,
            height: '172',
          })),
          count: 30,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2))
        .mockReturnValueOnce(of(mockResponse3));

      // Página 2, limit 10 (offset 10, precisa de 3 páginas SWAPI)
      const result = await service.getPeople(2, 10);

      expect(result).toHaveProperty('data');
    });

  });

  describe('getPlanets', () => {
    it('should return planets list', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Tatooine', population: '200000' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPlanets(1, 10);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
    });

    it('should handle rate limit error (429)', async () => {
      mockHttpService.get.mockReset();
      mockHttpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 429 } })),
      );

      await expect(service.getPlanets(1, 10)).rejects.toThrow(HttpException);
    });

    it('should handle generic error in getPlanets', async () => {
      mockHttpService.get.mockReset();
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getPlanets(1, 10)).rejects.toThrow(HttpException);
    });

    it('should handle pagination across multiple SWAPI pages for planets', async () => {
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 1}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 11}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      const result = await service.getPlanets(1, 15);

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(15);
    });

    it('should handle null count in planets response', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Tatooine', population: '200000' }],
          count: null,
        },
      };
      const mockFirstPageResponse = {
        data: {
          results: [{ name: 'Tatooine', population: '200000' }],
          count: 1,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse))
        .mockReturnValueOnce(of(mockFirstPageResponse));

      const result = await service.getPlanets(1, 10);

      expect(result).toHaveProperty('data');
      expect(result.total).toBe(1);
    });

    it('should handle pagination for planets - same page case', async () => {
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 1}`,
            population: '200000',
          })),
          count: 10,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPlanets(1, 5);

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(5);
    });

    it('should handle pagination for planets - first page case', async () => {
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 1}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 11}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      const result = await service.getPlanets(1, 15);

      expect(result).toHaveProperty('data');
    });

    it('should handle pagination for planets - last page case', async () => {
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 1}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 11}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      const result = await service.getPlanets(2, 15);

      expect(result).toHaveProperty('data');
    });

    it('should handle empty search string', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Tatooine', population: '200000' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPlanets(1, 10, '   ');

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
    });

    it('should handle undefined search parameter in getPlanets', async () => {
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 1}`,
            population: '200000',
          })),
          count: 10,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPlanets(1, 10, undefined);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(10);
    });

    it('should handle pagination for planets - intermediate pages case', async () => {
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 1}`,
            population: '200000',
          })),
          count: 30,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 11}`,
            population: '200000',
          })),
          count: 30,
        },
      };
      const mockResponse3 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 21}`,
            population: '200000',
          })),
          count: 30,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2))
        .mockReturnValueOnce(of(mockResponse3));

      const result = await service.getPlanets(2, 10);

      expect(result).toHaveProperty('data');
    });

    it('should handle pagination for planets with endIndex when (offset + limit) % 10 === 0', async () => {
      // Teste para quando (offset + limit) % 10 === 0, então endIndex = 10
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 1}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 11}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      // Página 2, limit 10 (offset 10, precisa de 2 páginas SWAPI, endIndex = 10)
      const result = await service.getPlanets(2, 10);

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(10);
    });

    it('should handle pagination for planets with endIndex when (offset + limit) % 10 !== 0', async () => {
      // Teste para quando (offset + limit) % 10 !== 0
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 1}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Planet ${i + 11}`,
            population: '200000',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      // Página 2, limit 8 (offset 8, precisa de 2 páginas SWAPI, endIndex = 6)
      const result = await service.getPlanets(2, 8);

      expect(result).toHaveProperty('data');
    });
  });

  describe('getStarships', () => {
    it('should return starships list', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Millennium Falcon', model: 'YT-1300' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getStarships(1, 10);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
    });

    it('should handle rate limit error (429)', async () => {
      mockHttpService.get.mockReset();
      mockHttpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 429 } })),
      );

      await expect(service.getStarships(1, 10)).rejects.toThrow(HttpException);
    });

    it('should handle generic error in getStarships', async () => {
      mockHttpService.get.mockReset();
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.getStarships(1, 10)).rejects.toThrow(HttpException);
    });

    it('should handle empty search string', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Millennium Falcon', model: 'YT-1300' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getStarships(1, 10, '   ');

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
    });

    it('should handle undefined search parameter in getStarships', async () => {
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 1}`,
            model: 'Model',
          })),
          count: 10,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getStarships(1, 10, undefined);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(10);
    });

    it('should handle pagination across multiple SWAPI pages for starships', async () => {
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 1}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 11}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      const result = await service.getStarships(1, 15);

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(15);
    });

    it('should handle null count in starships response', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'Millennium Falcon', model: 'YT-1300' }],
          count: null,
        },
      };
      const mockFirstPageResponse = {
        data: {
          results: [{ name: 'Millennium Falcon', model: 'YT-1300' }],
          count: 1,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse))
        .mockReturnValueOnce(of(mockFirstPageResponse));

      const result = await service.getStarships(1, 10);

      expect(result).toHaveProperty('data');
      expect(result.total).toBe(1);
    });

    it('should handle pagination for starships - same page case', async () => {
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 1}`,
            model: 'Model',
          })),
          count: 10,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getStarships(1, 5);

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(5);
    });

    it('should handle pagination for starships - first page case', async () => {
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 1}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 11}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      const result = await service.getStarships(1, 15);

      expect(result).toHaveProperty('data');
    });

    it('should handle pagination for starships - last page case', async () => {
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 1}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 11}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      const result = await service.getStarships(2, 15);

      expect(result).toHaveProperty('data');
    });

    it('should handle pagination for starships - intermediate pages case', async () => {
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 1}`,
            model: 'Model',
          })),
          count: 30,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 11}`,
            model: 'Model',
          })),
          count: 30,
        },
      };
      const mockResponse3 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 21}`,
            model: 'Model',
          })),
          count: 30,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2))
        .mockReturnValueOnce(of(mockResponse3));

      const result = await service.getStarships(2, 10);

      expect(result).toHaveProperty('data');
    });

    it('should handle pagination for starships with endIndex when (offset + limit) % 10 === 0', async () => {
      // Teste para quando (offset + limit) % 10 === 0, então endIndex = 10
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 1}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 11}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      // Página 2, limit 10 (offset 10, precisa de 2 páginas SWAPI, endIndex = 10)
      const result = await service.getStarships(2, 10);

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(10);
    });

    it('should handle pagination for starships with endIndex when (offset + limit) % 10 !== 0', async () => {
      // Teste para quando (offset + limit) % 10 !== 0
      const mockResponse1 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 1}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      const mockResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `Starship ${i + 11}`,
            model: 'Model',
          })),
          count: 20,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2));

      // Página 2, limit 8 (offset 8, precisa de 2 páginas SWAPI, endIndex = 6)
      const result = await service.getStarships(2, 8);

      expect(result).toHaveProperty('data');
    });
  });
});

