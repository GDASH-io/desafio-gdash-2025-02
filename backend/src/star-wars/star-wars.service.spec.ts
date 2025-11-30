import { Test, TestingModule } from '@nestjs/testing';
import { StarWarsService } from './star-wars.service';
import { HttpException } from '@nestjs/common';

// Helper para mockar o fetch global
global.fetch = jest.fn();

describe('StarWarsService', () => {
  let service: StarWarsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StarWarsService],
    }).compile();

    service = module.get<StarWarsService>(StarWarsService);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar dados da API SWAPI', async () => {
      const mockData = { results: [{ name: 'X-Wing' }], count: 1 };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await service.findAll(1);
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/starships/?page=1'),
      );
    });

    it('deve lançar erro se a API falhar', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(service.findAll(1)).rejects.toThrow(HttpException);
    });
  });

  describe('findOne', () => {
    it('deve retornar detalhes de uma nave', async () => {
      const mockData = { name: 'Death Star' };
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const result = await service.findOne(9);
      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/starships/9/'),
      );
    });
  });
});
