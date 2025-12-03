import { left, right, type Either } from '@/core/either';
import { WrongCredentialsError } from '@/core/errors/wrong-credentials-error';

import { UserRepository } from '../../repository/user-repository';
import { HashComparer } from '../../cryptography/hash-comparer';
import { Encrypter } from '../../cryptography/encrypter';
import { Inject, Injectable } from '@nestjs/common';

interface AuthenticateUserRequest {
  email: string;
  password: string;
}

type AuthenticateUserResponse = Either<
  WrongCredentialsError,
  { access_token: string }
>;
@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject(UserRepository) private userRepository: UserRepository,
    @Inject(HashComparer) private hashComparer: HashComparer,
    @Inject(Encrypter) private encrypter: Encrypter,
  ) {}
  async execute({
    email,
    password,
  }: AuthenticateUserRequest): Promise<AuthenticateUserResponse> {
    const emailExist = await this.userRepository.findByEmail(email);

    if (!emailExist) {
      return left(new WrongCredentialsError());
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      emailExist.password,
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError());
    }

    const access_token = await this.encrypter.encrypt({
      sub: emailExist.id.toString(),
    });

    return right({ access_token });
  }
}
