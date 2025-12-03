import { MakeClimate } from 'test/factory/make-climate-factory';
import { MakeUser } from 'test/factory/make-user-factory';
import { InMemoryClimateRepository } from 'test/repository/in-memory-climate-repository';
import { InMemoryUserRepository } from 'test/repository/in-memory-user-repository';
import { ReportClimateUseCase } from './report-climate-use-case';
import { FakeReport } from 'test/AI/fake-report';

let inMemoryClimateRepository: InMemoryClimateRepository;

let inMemoryUserRepository: InMemoryUserRepository;

let fakeReport: FakeReport;

let sut: ReportClimateUseCase;

describe('export (xlsx) Climate', () => {
  beforeEach(() => {
    inMemoryClimateRepository = new InMemoryClimateRepository();

    inMemoryUserRepository = new InMemoryUserRepository();

    fakeReport = new FakeReport();

    sut = new ReportClimateUseCase(
      inMemoryUserRepository,
      inMemoryClimateRepository,
      fakeReport,
    );
  });
  it('Should be able export (xlsx) Climate', async () => {
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
