import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = (await this.usersService.findOne(email)) as UserDocument;

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    const storedPassword: string = user.password;

    const isMatch = await bcrypt.compare(pass, storedPassword);
    if (!isMatch) {
      throw new UnauthorizedException('Senha incorreta');
    }

    const payload = { sub: user._id, username: user.email, name: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { name: user.name, email: user.email },
    };
  }
}
