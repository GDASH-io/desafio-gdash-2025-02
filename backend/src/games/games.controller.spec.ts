import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

describe('GamesController', () => {
  let controller: GamesController;
  let service: GamesService;

  const mockGamesService = {
    getGames: jest.fn(),
    getGameById: jest.fn(),
    getAvailablePlatforms: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
      providers: [
        {
          provide: GamesService,
          useValue: mockGamesService,
        },
      ],
    }).compile();

    controller = module.get<GamesController>(GamesController);
    service = module.get<GamesService>(GamesService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getGames', () => {
    it('should return games list with default pagination', async () => {
      const mockResult = { results: [], count: 0 };
      mockGamesService.getGames.mockResolvedValue(mockResult);

      const result = await controller.getGames();

      expect(service.getGames).toHaveBeenCalledWith(1, 20, undefined, undefined);
      expect(result).toEqual(mockResult);
    });

    it('should return games list with platform filter', async () => {
      const mockResult = { results: [], count: 0 };
      mockGamesService.getGames.mockResolvedValue(mockResult);

      const result = await controller.getGames(1, 20, 'PS5', 'game');

      expect(service.getGames).toHaveBeenCalledWith(1, 20, 187, 'game');
      expect(result).toEqual(mockResult);
    });

    it('should map platform names to IDs correctly', async () => {
      const mockResult = { results: [], count: 0 };
      mockGamesService.getGames.mockResolvedValue(mockResult);

      await controller.getGames(1, 20, 'Xbox');
      expect(service.getGames).toHaveBeenCalledWith(1, 20, 186, undefined);

      await controller.getGames(1, 20, 'Switch');
      expect(service.getGames).toHaveBeenCalledWith(1, 20, 7, undefined);

      await controller.getGames(1, 20, 'PC');
      expect(service.getGames).toHaveBeenCalledWith(1, 20, 4, undefined);
    });

    it('should handle invalid platform name', async () => {
      const mockResult = { results: [], count: 0 };
      mockGamesService.getGames.mockResolvedValue(mockResult);

      await controller.getGames(1, 20, 'InvalidPlatform');

      // Quando a plataforma não existe no mapeamento, platformId deve ser undefined
      expect(service.getGames).toHaveBeenCalledWith(1, 20, undefined, undefined);
    });
  });

  describe('getPlatforms', () => {
    it('should return available platforms', async () => {
      const mockPlatforms = ['PS5', 'Xbox', 'Switch', 'PC'];
      mockGamesService.getAvailablePlatforms.mockResolvedValue(mockPlatforms);

      const result = await controller.getPlatforms();

      expect(service.getAvailablePlatforms).toHaveBeenCalled();
      expect(result).toEqual(mockPlatforms);
    });
  });

  describe('getGameById', () => {
    it('should return game by id', async () => {
      const mockGame = { id: 1, name: 'Test Game' };
      mockGamesService.getGameById.mockResolvedValue(mockGame);

      const result = await controller.getGameById('1');

      expect(service.getGameById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockGame);
    });
  });
});

