import { left, right, type Either } from '@/core/either';
import { User } from '../../../enterprise/entities/user';
import { UserRepository } from '../../repository/user-repository';
import { Inject, Injectable } from '@nestjs/common';
import { ResourceNotFoundError } from '@/core/errors/resource-not-found-error';

interface GetUserRequest {
  id: string; // id from User
}

type GetUserResponse = Either<ResourceNotFoundError, { user: User }>;
@Injectable()
export class GetUserUseCase {
  constructor(@Inject(UserRepository) private userRepository: UserRepository) {}
  async execute({ id }: GetUserRequest): Promise<GetUserResponse> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      return left(new ResourceNotFoundError());
    }
    return right({ user });
  }
}
