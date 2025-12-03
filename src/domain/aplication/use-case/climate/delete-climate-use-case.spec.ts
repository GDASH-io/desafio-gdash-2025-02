import { FakeHasher } from 'test/cryptography/fake-hasher';
import { MakeClimate } from 'test/factory/make-climate-factory';
import { InMemoryClimateRepository } from 'test/repository/in-memory-climate-repository';
import { DeleteClimateUseCase } from './delete-climate-use-case';

let inMemoryClimateRepository: InMemoryClimateRepository;

let hashGenerator: FakeHasher;

let sut: DeleteClimateUseCase;

describe('Delete Climate', () => {
  beforeEach(() => {
    inMemoryClimateRepository = new InMemoryClimateRepository();

    hashGenerator = new FakeHasher();

    sut = new DeleteClimateUseCase(inMemoryClimateRepository);
  });
  it('Should be able delete climate', async () => {
    const climate = MakeClimate();

    await inMemoryClimateRepository.create(climate);

    const result = await sut.execute({
      id: climate.id.toString(),
    });

    expect(inMemoryClimateRepository.items).toHaveLength(0);
    expect(result.isRight()).toBe(true);
  });
});
