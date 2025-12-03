import { InMemoryUserRepository } from 'test/repository/in-memory-user-repository';
import { CreateUserUseCase } from './create-user-use-case';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { MakeUser } from 'test/factory/make-user-factory';

let inMemoryUserRepository: InMemoryUserRepository;

let hashGenerator: FakeHasher;

let sut: CreateUserUseCase;

describe('Create User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();

    hashGenerator = new FakeHasher();

    sut = new CreateUserUseCase(inMemoryUserRepository, hashGenerator);
  });
  it('Should be able create user', async () => {
    const { name, userName, email, password } = MakeUser();

    const result = await sut.execute({
      name,
      userName,
      email,
      password,
    });

    expect(result.isRight()).toBe(true);
  });
  it('Should not be able create user already exist', async () => {
    const user = MakeUser();

    await inMemoryUserRepository.create(user);

    const result = await sut.execute({
      name: user.name,
      userName: user.userName,
      email: user.email,
      password: user.password,
    });
    expect(result.isLeft()).toBe(true);
  });
});
