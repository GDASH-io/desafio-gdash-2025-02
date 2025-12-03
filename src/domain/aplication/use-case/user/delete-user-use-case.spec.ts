import { UniqueEntityID } from '@/core/entities/unique-entity-id';
import { DeleteUserUseCase } from './delete-user-use-case';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { InMemoryUserRepository } from 'test/repository/in-memory-user-repository';
import { MakeUser } from 'test/factory/make-user-factory';

let inMemoryUserRepository: InMemoryUserRepository;

let sut: DeleteUserUseCase;

describe('Delete User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();

    sut = new DeleteUserUseCase(inMemoryUserRepository);
  });
  it('Should be able delete user', async () => {
    const user = MakeUser();

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      id: user.id.toString(),
      email: user.email,
    });

    expect(result.isRight).toBeTruthy();
    expect(inMemoryUserRepository.items).toHaveLength(0);
  });
  it('Should not be able delete another user', async () => {
    const user = MakeUser();

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      id: new UniqueEntityID().toString(),
      email: user.email,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
  });
});
