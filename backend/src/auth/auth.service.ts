import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Usuário não encontrado');
    
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Senha inválida');
    
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    const payload = { sub: user._id, email: user.email, role: user.role };
    
    return {
      accessToken: this.jwt.sign(payload),  // 🔥 MUDOU: camelCase
      user: {
        _id: user._id,  // 🔥 MUDOU: _id ao invés de id
        email: user.email,
        role: user.role,
      },
    };
  }
}
