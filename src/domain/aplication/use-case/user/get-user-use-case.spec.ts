import { InMemoryUserRepository } from 'test/repository/in-memory-user-repository';
import { MakeUser } from 'test/factory/make-user-factory';
import { GetUserUseCase } from './get-user-use-case';
import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

let inMemoryUserRepository: InMemoryUserRepository;
let sut: GetUserUseCase;

describe('Get User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    sut = new GetUserUseCase(inMemoryUserRepository);
  });
  it('Should be able get user by id', async () => {
    const user = MakeUser();
    await inMemoryUserRepository.create(user);
    const result = await sut.execute({
      id: user.id.toString(),
    });

    expect(result.isRight()).toBe(true);
  });
  it('Should not be able get user by another id', async () => {
    const user = MakeUser();
    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      id: new UniqueEntityID().toString(),
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
