import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import { IUserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string) {
    if (!id || id === 'undefined' || id.trim() === '') {
      throw new BadRequestException('ID do usuário é obrigatório');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID do usuário inválido');
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return { message: 'Usuário removido com sucesso' };
  }
}

