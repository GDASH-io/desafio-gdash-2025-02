import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any | null> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(normalizedEmail);

    if (!user) return null;

    const senhaConfere = await bcrypt.compare(password, user.password);
    if (!senhaConfere) return null;

    const obj = user.toObject ? user.toObject() : user;
    delete obj.password;

    return obj;
  }

  async login(user: any): Promise<{ access_token: string; user: any }> {
    if (!user || !user._id) {
      throw new Error("User is missing _id");
    }

    const payload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    return this.login(user);
  }
}
