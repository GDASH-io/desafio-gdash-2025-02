import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { SpacexService } from './spacex.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SpacexService', () => {
  let service: SpacexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpacexService],
    }).compile();

    service = module.get<SpacexService>(SpacexService);
  });

  it('findAll() deve retornar dados paginados da SpaceX', async () => {
    const mockResponse = {
      data: {
        docs: [{ name: 'Falcon 9' }],
        totalDocs: 100,
        page: 1,
        limit: 10,
        totalPages: 10,
      },
    };

    mockedAxios.post.mockResolvedValue(mockResponse);

    const result = await service.findAll(1, 10);

    expect(mockedAxios.post).toHaveBeenCalled();
    expect(result.data[0].name).toBe('Falcon 9');
    expect(result.meta.total).toBe(100);
  });

  it('findAll() deve lançar erro se a API falhar', async () => {
    mockedAxios.post.mockRejectedValue(new Error('API Error'));
    await expect(service.findAll(1, 10)).rejects.toThrow();
  });
});
