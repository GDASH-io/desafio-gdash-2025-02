// src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    const payload = { sub: (user as any)._id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);

    //tirar a senha
    const { password, ...userResult } = (user as any)._doc; 

    return {
      access_token: accessToken,
      user: userResult,
    };
  }
}