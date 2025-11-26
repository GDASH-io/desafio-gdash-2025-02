import { Injectable, Inject } from '@nestjs/common';
import { IUserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(page?: number, limit?: number) {
    return this.userRepository.findAll({ page, limit });
  }
}

