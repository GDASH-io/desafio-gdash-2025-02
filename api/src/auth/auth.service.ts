import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    
    const userDoc = user as any;
    const userId = userDoc._id?.toString() || userDoc.id?.toString();
    
    const payload = { email: user.email, sub: userId };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userId,
        email: user.email,
        name: user.name,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const userDoc = user as any;
    const userId = userDoc._id?.toString() || userDoc.id?.toString();

    return {
      id: userId,
      _id: userId,
      email: userDoc.email,
      name: userDoc.name,
      isActive: userDoc.isActive,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name || null,
      },
    };
  }
}
