import { Test, TestingModule } from '@nestjs/testing';
import { StarWarsController } from './starwars.controller';
import { StarWarsService } from './starwars.service';

describe('StarWarsController', () => {
  let controller: StarWarsController;
  let service: StarWarsService;

  const mockStarWarsService = {
    getPeople: jest.fn(),
    getPlanets: jest.fn(),
    getStarships: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StarWarsController],
      providers: [
        {
          provide: StarWarsService,
          useValue: mockStarWarsService,
        },
      ],
    }).compile();

    controller = module.get<StarWarsController>(StarWarsController);
    service = module.get<StarWarsService>(StarWarsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPeople', () => {
    it('should return people list with default pagination', async () => {
      const mockResult = { results: [], count: 0 };
      mockStarWarsService.getPeople.mockResolvedValue(mockResult);

      const result = await controller.getPeople();

      expect(service.getPeople).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual(mockResult);
    });

    it('should return people list with custom pagination and search', async () => {
      const mockResult = { results: [], count: 0 };
      mockStarWarsService.getPeople.mockResolvedValue(mockResult);

      const result = await controller.getPeople(2, 5, 'luke');

      expect(service.getPeople).toHaveBeenCalledWith(2, 5, 'luke');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getPlanets', () => {
    it('should return planets list', async () => {
      const mockResult = { results: [], count: 0 };
      mockStarWarsService.getPlanets.mockResolvedValue(mockResult);

      const result = await controller.getPlanets();

      expect(service.getPlanets).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getStarships', () => {
    it('should return starships list', async () => {
      const mockResult = { results: [], count: 0 };
      mockStarWarsService.getStarships.mockResolvedValue(mockResult);

      const result = await controller.getStarships();

      expect(service.getStarships).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual(mockResult);
    });
  });
});

