import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { PokemonService } from './pokemon.service';
import { LoggerService } from '../common/logger/logger.service';
import { of, throwError } from 'rxjs';

describe('PokemonService', () => {
  let service: PokemonService;
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
        PokemonService,
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

    service = module.get<PokemonService>(PokemonService);
    httpService = module.get<HttpService>(HttpService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getPokemonList', () => {
    it('should return pokemon list without search', async () => {
      const mockListResponse = {
        data: {
          results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
          count: 1,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 25,
          name: 'pikachu',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'electric' } }],
          height: 4,
          weight: 60,
        },
      };
      
      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse))
        .mockReturnValueOnce(of(mockDetailResponse));

      const result = await service.getPokemonList(1, 20);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
    });

    it('should set hasPreviousPage to false when page is 1 in normal search', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
          count: 1,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 25,
          name: 'pikachu',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'electric' } }],
          height: 4,
          weight: 60,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse))
        .mockReturnValueOnce(of(mockDetailResponse));

      const result = await service.getPokemonList(1, 20);

      expect(result.hasPreviousPage).toBe(false);
    });

    it('should set hasNextPage to false when page equals totalPages in normal search', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
          count: 1,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 25,
          name: 'pikachu',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'electric' } }],
          height: 4,
          weight: 60,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse))
        .mockReturnValueOnce(of(mockDetailResponse));

      const result = await service.getPokemonList(1, 20);

      expect(result.hasNextPage).toBe(false);
    });

    it('should set hasPreviousPage to true when page > 1 in normal search', async () => {
      // Para busca normal sem search term, o código usa offset/limit diretamente
      // offset = (page - 1) * limit = (2 - 1) * 10 = 10
      const mockResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `pokemon${i + 10}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i + 11}/`,
          })),
          count: 20,
        },
      };
      // Para cada pokemon na lista, precisa buscar detalhes (10 pokemon = 10 chamadas)
      const mockDetailResponses = Array(10).fill(null).map((_, i) => ({
        data: {
          id: i + 11,
          name: `pokemon${i + 10}`,
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'normal' } }],
          height: 4,
          weight: 60,
        },
      }));
      
      // Para busca normal, 1 chamada com offset=10, limit=10, depois 10 chamadas para detalhes
      mockHttpService.get
        .mockReturnValueOnce(of(mockResponse))
        .mockReturnValueOnce(of(mockDetailResponses[0]))
        .mockReturnValueOnce(of(mockDetailResponses[1]))
        .mockReturnValueOnce(of(mockDetailResponses[2]))
        .mockReturnValueOnce(of(mockDetailResponses[3]))
        .mockReturnValueOnce(of(mockDetailResponses[4]))
        .mockReturnValueOnce(of(mockDetailResponses[5]))
        .mockReturnValueOnce(of(mockDetailResponses[6]))
        .mockReturnValueOnce(of(mockDetailResponses[7]))
        .mockReturnValueOnce(of(mockDetailResponses[8]))
        .mockReturnValueOnce(of(mockDetailResponses[9]));

      const result = await service.getPokemonList(2, 10);

      expect(result.hasPreviousPage).toBe(true);
    });

    it('should return pokemon list with search', async () => {
      const mockResponse = {
        data: {
          results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
          count: 1,
        },
      };
      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPokemonList(1, 20, 'pikachu');

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page');
    });
  });

  describe('getPokemonById', () => {
    it('should return pokemon by id', async () => {
      const mockPokemon = {
        id: 25,
        name: 'pikachu',
        sprites: { front_default: 'image.png' },
        types: [{ type: { name: 'electric' } }],
        height: 4,
        weight: 60,
        abilities: [{ ability: { name: 'static' } }],
        stats: [{ stat: { name: 'hp' }, base_stat: 35 }],
        moves: [{ move: { name: 'thunderbolt' } }],
      };
      mockHttpService.get.mockReturnValue(of({ data: mockPokemon }));

      const result = await service.getPokemonById(25);

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('id', 25);
      expect(result).toHaveProperty('name', 'pikachu');
    });

    it('should throw error when pokemon not found', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 404 } })),
      );

      await expect(service.getPokemonById(99999)).rejects.toThrow();
    });

    it('should handle rate limit error (429)', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 429 } })),
      );

      await expect(service.getPokemonById(25)).rejects.toThrow();
    });
  });

  describe('getPokemonList error handling', () => {
    it('should handle rate limit error (429) when fetching list', async () => {
      mockHttpService.get.mockReturnValue(
        throwError(() => ({ response: { status: 429 } })),
      );

      await expect(service.getPokemonList(1, 20)).rejects.toThrow();
    });

    it('should handle rate limit error (429) when fetching details', async () => {
      const mockListResponse = {
        data: {
          results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
          count: 1,
        },
      };
      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse))
        .mockReturnValueOnce(
          throwError(() => ({ response: { status: 429 } })),
        );

      await expect(service.getPokemonList(1, 20)).rejects.toThrow();
    });

    it('should ignore empty search string', async () => {
      const mockListResponse = {
        data: {
          results: [{ name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' }],
          count: 1,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 25,
          name: 'pikachu',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'electric' } }],
          height: 4,
          weight: 60,
        },
      };
      
      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse))
        .mockReturnValueOnce(of(mockDetailResponse));

      const result = await service.getPokemonList(1, 20, '   ');

      expect(httpService.get).toHaveBeenCalled();
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
    });

    it('should stop searching when results.length < pageSize', async () => {
      const mockListResponse1 = {
        data: {
          results: Array(30).fill(null).map((_, i) => ({
            name: `pokemon${i}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
          })),
          count: 30,
        },
      };
      const mockListResponse2 = {
        data: {
          results: Array(20).fill(null).map((_, i) => ({
            name: `pokemon${i + 30}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i + 31}/`,
          })),
          count: 50,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 1,
          name: 'pokemon0',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'normal' } }],
          height: 4,
          weight: 60,
        },
      };

      // Mock para primeira página com 30 resultados (pageSize = 50, então não para)
      // Mock para segunda página com 20 resultados (pageSize = 50, então para)
      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse1))
        .mockReturnValueOnce(of(mockDetailResponse))
        .mockReturnValueOnce(of(mockListResponse2));

      const result = await service.getPokemonList(1, 20, 'pokemon');

      expect(result).toHaveProperty('data');
    });

    it('should handle rate limit during detail fetch in search', async () => {
      const mockListResponse = {
        data: {
          results: [
            { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
            { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
          ],
          count: 2,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 25,
          name: 'pikachu',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'electric' } }],
          height: 4,
          weight: 60,
        },
      };

      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse))
        .mockReturnValueOnce(of(mockDetailResponse))
        .mockReturnValueOnce(throwError(() => ({ response: { status: 429 } })));

      const result = await service.getPokemonList(1, 20, 'pikachu');

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should continue search when non-429 error occurs during detail fetch', async () => {
      const mockListResponse = {
        data: {
          results: [
            { name: 'pikachu', url: 'https://pokeapi.co/api/v2/pokemon/25/' },
            { name: 'charizard', url: 'https://pokeapi.co/api/v2/pokemon/6/' },
          ],
          count: 2,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 25,
          name: 'pikachu',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'electric' } }],
          height: 4,
          weight: 60,
        },
      };

      // Primeiro pokemon sucesso, segundo pokemon erro não-429 (é ignorado no catch)
      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse))
        .mockReturnValueOnce(of(mockDetailResponse))
        .mockReturnValueOnce(throwError(() => ({ response: { status: 500 } })));

      // O erro não-429 é ignorado no catch, então a busca continua
      const result = await service.getPokemonList(1, 20, 'pikachu');
      expect(result).toHaveProperty('data');
    });

    it('should handle pagination with hasPreviousPage and hasNextPage in search', async () => {
      const mockListResponse = {
        data: {
          results: Array(50).fill(null).map((_, i) => ({
            name: `pokemon${i}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
          })),
          count: 50,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 1,
          name: 'pokemon0',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'normal' } }],
          height: 4,
          weight: 60,
        },
      };

      // Mock para retornar múltiplos pokemon
      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse))
        .mockReturnValue(throwError(() => ({ response: { status: 429 } }))); // Rate limit após primeira página

      const result = await service.getPokemonList(2, 10, 'pokemon');

      expect(result).toHaveProperty('hasPreviousPage');
      expect(result).toHaveProperty('hasNextPage');
    });

    it('should set hasPreviousPage to false when page is 1 in search', async () => {
      const mockListResponse = {
        data: {
          results: Array(20).fill(null).map((_, i) => ({
            name: `pokemon${i}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
          })),
          count: 20,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 1,
          name: 'pokemon0',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'normal' } }],
          height: 4,
          weight: 60,
        },
      };

      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse))
        .mockReturnValueOnce(of(mockDetailResponse))
        .mockReturnValueOnce(throwError(() => ({ response: { status: 429 } })));

      const result = await service.getPokemonList(1, 10, 'pokemon');

      expect(result.hasPreviousPage).toBe(false);
    });

    it('should set hasNextPage to false when page equals totalPages in search', async () => {
      // Mock para retornar apenas 1 pokemon (total = 1, totalPages = 1)
      const mockListResponseSmall = {
        data: {
          results: Array(1).fill(null).map((_, i) => ({
            name: `pokemon${i}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
          })),
          count: 1,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 1,
          name: 'pokemon0',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'normal' } }],
          height: 4,
          weight: 60,
        },
      };

      // Mock para retornar apenas 1 pokemon que corresponde ao termo de busca
      // Vamos usar um termo de busca muito específico que corresponda apenas a 1 pokemon
      // Primeira página retorna menos de 50 resultados para parar a busca imediatamente
      const mockListResponse = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: i === 0 ? 'unique-pokemon-name' : `other${i}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
          })),
          count: 10,
        },
      };
      const mockDetailResponseUnique = {
        data: {
          id: 1,
          name: 'unique-pokemon-name',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'normal' } }],
          height: 4,
          weight: 60,
        },
      };
      // O código faz: 1) get lista página 1, 2) get detalhe do pokemon único
      // Como results.length (10) < pageSize (50), o código para a busca
      // Resetar o mock antes de configurar
      mockHttpService.get.mockReset();
      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse)) // Página 1 da lista
        .mockReturnValueOnce(of(mockDetailResponseUnique)); // Detalhe do pokemon único

      const result = await service.getPokemonList(1, 10, 'unique-pokemon-name');

      // Com apenas 1 resultado encontrado e limit=10, totalPages=Math.ceil(1/10)=1
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.hasNextPage).toBe(false);
    });

    it('should handle case where results.length equals pageSize exactly', async () => {
      // Teste para quando results.length === pageSize (não deve parar)
      // Primeira página retorna 50 resultados, mas apenas alguns correspondem
      const mockListResponse1 = {
        data: {
          results: Array(50).fill(null).map((_, i) => ({
            name: i < 5 ? `pokemon${i}` : `other${i}`, // Apenas 5 correspondem
            url: `https://pokeapi.co/api/v2/pokemon/${i + 1}/`,
          })),
          count: 100,
        },
      };
      // Segunda página retorna menos de 50 para parar a busca
      const mockListResponse2 = {
        data: {
          results: Array(10).fill(null).map((_, i) => ({
            name: `other${i + 50}`,
            url: `https://pokeapi.co/api/v2/pokemon/${i + 51}/`,
          })),
          count: 60,
        },
      };
      const mockDetailResponse = {
        data: {
          id: 1,
          name: 'pokemon0',
          sprites: { front_default: 'image.png' },
          types: [{ type: { name: 'normal' } }],
          height: 4,
          weight: 60,
        },
      };

      // Resetar o mock antes de configurar
      mockHttpService.get.mockReset();
      // Configurar mock para: 1) lista página 1, 2-6) detalhes dos 5 pokemon, 7) lista página 2
      mockHttpService.get
        .mockReturnValueOnce(of(mockListResponse1)) // Página 1 da lista
        .mockReturnValueOnce(of(mockDetailResponse)) // Detalhe pokemon 0
        .mockReturnValueOnce(of(mockDetailResponse)) // Detalhe pokemon 1
        .mockReturnValueOnce(of(mockDetailResponse)) // Detalhe pokemon 2
        .mockReturnValueOnce(of(mockDetailResponse)) // Detalhe pokemon 3
        .mockReturnValueOnce(of(mockDetailResponse)) // Detalhe pokemon 4
        .mockReturnValueOnce(of(mockListResponse2)); // Página 2 da lista (para parar)

      const result = await service.getPokemonList(1, 20, 'pokemon');

      expect(result).toHaveProperty('data');
      expect(result.data.length).toBe(5); // Apenas 5 pokemon correspondem
    });
  });
});

