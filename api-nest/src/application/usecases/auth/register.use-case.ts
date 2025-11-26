import { Injectable, ConflictException, Inject } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IUserRepository } from '../../../domain/repositories/user.repository';
import { RegisterDto } from '../../../presentation/dto/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.userRepository.create({
      email: registerDto.email,
      password: hashedPassword,
      name: registerDto.name,
      role: 'user',
    });

    return {
      message: 'Usuário criado com sucesso',
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        name: user.name,
      },
    };
  }
}

