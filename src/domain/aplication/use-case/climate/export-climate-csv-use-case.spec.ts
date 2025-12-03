import { MakeClimate } from 'test/factory/make-climate-factory';
import { MakeUser } from 'test/factory/make-user-factory';
import { InMemoryClimateRepository } from 'test/repository/in-memory-climate-repository';
import { InMemoryUserRepository } from 'test/repository/in-memory-user-repository';
import { ExportCSVUseCase } from './export-climate-csv-use-case';
import { FakeExport } from 'test/export/fake-export';

let inMemoryClimateRepository: InMemoryClimateRepository;

let inMemoryUserRepository: InMemoryUserRepository;

let fakeExport: FakeExport;

let sut: ExportCSVUseCase;

describe('export (csv) Climate', () => {
  beforeEach(() => {
    inMemoryClimateRepository = new InMemoryClimateRepository();

    inMemoryUserRepository = new InMemoryUserRepository();

    fakeExport = new FakeExport();

    sut = new ExportCSVUseCase(
      inMemoryUserRepository,
      inMemoryClimateRepository,
      fakeExport,
    );
  });
  it('Should be able export (csv) Climate', async () => {
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
});
