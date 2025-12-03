import { MakeClimate } from 'test/factory/make-climate-factory';
import { MakeUser } from 'test/factory/make-user-factory';
import { InMemoryClimateRepository } from 'test/repository/in-memory-climate-repository';
import { InMemoryUserRepository } from 'test/repository/in-memory-user-repository';
import { GetClimateUseCase } from './get-climate-use-case';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

let inMemoryClimateRepository: InMemoryClimateRepository;

let inMemoryUserRepository: InMemoryUserRepository;

let sut: GetClimateUseCase;

describe('Get Climate', () => {
  beforeEach(() => {
    inMemoryClimateRepository = new InMemoryClimateRepository();

    inMemoryUserRepository = new InMemoryUserRepository();

    sut = new GetClimateUseCase(
      inMemoryUserRepository,
      inMemoryClimateRepository,
    );
  });
  it('Should be able get climate', async () => {
    const user = MakeUser();

    await inMemoryUserRepository.create(user);

    for (let i = 0; i < 30; i++) {
      const climate = MakeClimate();
      await inMemoryClimateRepository.create(climate);
    }

    const result = await sut.execute({
      id: user.id.toString(),
      page: 1,
    });

    expect(result.isRight()).toBe(true);
  });

  it('Should not be able get climate from pagination no-existent', async () => {
    const user = MakeUser();
    await inMemoryUserRepository.create(user);

    for (let i = 0; i < 30; i++) {
      const climate = MakeClimate();
      await inMemoryClimateRepository.create(climate);
    }

    const result = await sut.execute({
      id: user.id.toString(),
      page: 4,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
