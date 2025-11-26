import { Injectable, NotFoundException, ConflictException, BadRequestException, Inject } from '@nestjs/common';
import { Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { UpdateUserDto } from '../../../presentation/dto/update-user.dto';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(id: string, updateUserDto: UpdateUserDto) {
    if (!id || id === 'undefined' || id.trim() === '') {
      throw new BadRequestException('ID do usuário é obrigatório');
    }

    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID do usuário inválido');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const updateData: any = {};
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(updateUserDto.email);
      if (existingUser) {
        throw new ConflictException('Email já cadastrado');
      }
      updateData.email = updateUserDto.email;
    }
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    if (updateUserDto.name) {
      updateData.name = updateUserDto.name;
    }
    if (updateUserDto.role) {
      updateData.role = updateUserDto.role;
    }

    const updated = await this.userRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return updated;
  }
}

