import { InMemoryUserRepository } from 'test/repository/in-memory-user-repository';
import { EditUserUseCase } from './edit-user-use-case';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { MakeUser } from 'test/factory/make-user-factory';

let inMemoryUserRepository: InMemoryUserRepository;

let hashGenerator: FakeHasher;

let sut: EditUserUseCase;

describe('Edit User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();
    hashGenerator = new FakeHasher();
    sut = new EditUserUseCase(inMemoryUserRepository, hashGenerator);
  });
  it('Should be able edit user', async () => {
    const user = MakeUser();

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      id: user.id.toString(),
      name: 'john Snow',
      userName: 'john_123',
      email: user.email,
      password: 'newPassword',
    });

    expect(result.isRight()).toBe(true);
  });
  it('Should not be able edit user with another email', async () => {
    const user = MakeUser();

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      id: user.id.toString(),
      name: 'john Snow',
      userName: 'john_123',
      email: 'anotherEmail@email.com',
      password: 'newPassword',
    });

    expect(result.isLeft()).toBe(true);
  });
});
