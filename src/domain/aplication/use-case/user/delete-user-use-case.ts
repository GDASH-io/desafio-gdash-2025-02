import { left, right, type Either } from '@/core/either';
import { WrongCredentialsError } from '@/core/errors/wrong-credentials-error';

import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';
import { Inject, Injectable } from '@nestjs/common';
import { UserRepository } from '../../repository/user-repository';

interface DeleteUserRequest {
  id: string; //id from jwt
  email: string;
}

type DeleteUserResponse = Either<WrongCredentialsError, { message: string }>;

@Injectable()
export class DeleteUserUseCase {
  constructor(@Inject(UserRepository) private userRepository: UserRepository) {}

  async execute({ id, email }: DeleteUserRequest): Promise<DeleteUserResponse> {
    const admin = await this.userRepository.findById(id);

    if (!admin) {
      return left(new ResourceNotFoundError());
    }

    if (admin.email !== email) {
      return left(new WrongCredentialsError());
    }

    await this.userRepository.delete(id);

    return right({ message: 'User Deleted' });
  }
}
