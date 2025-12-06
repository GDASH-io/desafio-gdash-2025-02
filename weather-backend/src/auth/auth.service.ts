import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!(user && (await bcrypt.compare(password, user.password)))) {
      throw new UnauthorizedException();
    }
    const payload = {
      username: user.name,
      email: user.email,
      sub: user._id,
      role: user.role,
    };

    const access_token = await this.jwtService.signAsync(payload);
    return {
      access_token: access_token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
}
