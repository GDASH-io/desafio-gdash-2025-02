import { Test, TestingModule } from '@nestjs/testing';
import { PokemonController } from './pokemon.controller';
import { PokemonService } from './pokemon.service';

describe('PokemonController', () => {
  let controller: PokemonController;
  let service: PokemonService;

  const mockPokemonService = {
    getPokemonList: jest.fn(),
    getPokemonById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PokemonController],
      providers: [
        {
          provide: PokemonService,
          useValue: mockPokemonService,
        },
      ],
    }).compile();

    controller = module.get<PokemonController>(PokemonController);
    service = module.get<PokemonService>(PokemonService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPokemonList', () => {
    it('should return pokemon list with default pagination', async () => {
      const mockResult = { results: [], count: 0 };
      mockPokemonService.getPokemonList.mockResolvedValue(mockResult);

      const result = await controller.getPokemonList();

      expect(service.getPokemonList).toHaveBeenCalledWith(1, 20, undefined);
      expect(result).toEqual(mockResult);
    });

    it('should return pokemon list with custom pagination', async () => {
      const mockResult = { results: [], count: 0 };
      mockPokemonService.getPokemonList.mockResolvedValue(mockResult);

      const result = await controller.getPokemonList(2, 10, 'pikachu');

      expect(service.getPokemonList).toHaveBeenCalledWith(2, 10, 'pikachu');
      expect(result).toEqual(mockResult);
    });
  });

  describe('getPokemonById', () => {
    it('should return pokemon by id', async () => {
      const mockPokemon = { id: 1, name: 'pikachu' };
      mockPokemonService.getPokemonById.mockResolvedValue(mockPokemon);

      const result = await controller.getPokemonById('1');

      expect(service.getPokemonById).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockPokemon);
    });
  });
});

