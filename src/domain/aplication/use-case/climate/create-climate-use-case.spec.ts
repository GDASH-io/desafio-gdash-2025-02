import { InMemoryClimateRepository } from 'test/repository/in-memory-climate-repository';
import { CreateClimateUseCase } from './create-climate-use-case';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { MakeClimate } from 'test/factory/make-climate-factory';

let inMemoryClimateRepository: InMemoryClimateRepository;

let hashGenerator: FakeHasher;

let sut: CreateClimateUseCase;

describe('Create Climate', () => {
  beforeEach(() => {
    inMemoryClimateRepository = new InMemoryClimateRepository();

    hashGenerator = new FakeHasher();

    sut = new CreateClimateUseCase(inMemoryClimateRepository);
  });
  it('Should be able create climate', async () => {
    const climate = MakeClimate();

    const result = await sut.execute({
      temperature: climate.temperature,
      timeStamp: climate.timeStamp,
      weatherCode: climate.weatherCode,
      windDirection: climate.windDirection,
      windSpeed: climate.windSpeed,
    });

    expect(inMemoryClimateRepository.items).toHaveLength(1);
    expect(result.isRight()).toBe(true);
  });
});
