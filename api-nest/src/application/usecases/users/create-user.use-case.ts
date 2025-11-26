import { Injectable, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { CreateUserDto } from '../../../presentation/dto/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(createUserDto: CreateUserDto) {
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      role: createUserDto.role || 'user',
    });

    return {
      id: (user as any)._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: (user as any).createdAt,
    };
  }
}

