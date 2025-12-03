import { left, right, type Either } from '@/core/either';
import { User } from '../../../enterprise/entities/user';

import { UserRepository } from '../../repository/user-repository';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { NotAllowedError } from '@/core/errors/not-allowed-error';
import { HashGenerator } from '../../cryptography/hash-generator';
import { Inject, Injectable } from '@nestjs/common';

interface EditUserRequest {
  id: string;
  name: string;
  userName: string;
  email: string;
  password: string;
}

type EditUserResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  { user: User }
>;

@Injectable()
export class EditUserUseCase {
  constructor(
    @Inject(UserRepository) private userRepository: UserRepository,
    @Inject(HashGenerator) private hashGenerator: HashGenerator,
  ) {}
  async execute({
    id,
    name,
    userName,
    email,
    password,
  }: EditUserRequest): Promise<EditUserResponse> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      return left(new ResourceNotFoundError());
    }

    if (user.id.toString() !== id) {
      return left(new NotAllowedError());
    }

    const passwordHashed = await this.hashGenerator.hash(password);

    user.name = name;
    user.userName = userName;
    user.email = email;
    user.password = passwordHashed;

    await this.userRepository.save(user);

    return right({ user });
  }
}
