import { User } from '@/domain/enterprise/entities/user';
import { AuthenticateUserUseCase } from './authenticate-use-case';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { InMemoryUserRepository } from 'test/repository/in-memory-user-repository';
import { FakeHasher } from 'test/cryptography/fake-hasher';

let inMemoryUserRepository: InMemoryUserRepository;

let hashGenerator: FakeHasher;

let encrypter: FakeEncrypter;

let sut: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUserRepository = new InMemoryUserRepository();

    hashGenerator = new FakeHasher();

    encrypter = new FakeEncrypter();

    sut = new AuthenticateUserUseCase(
      inMemoryUserRepository,
      hashGenerator,
      encrypter,
    );
  });

  it('Should be able authenticate user', async () => {
    const user = User.create({
      name: 'john Snow',
      userName: 'john_123',
      email: 'john@email.com',
      password: await hashGenerator.hash('123123'),
    });

    inMemoryUserRepository.items.push(user);

    const result = await sut.execute({
      email: user.email,
      password: '123123',
    });

    expect(result.isRight()).toBe(true);
  });
});
