import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { User } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

export type SafeUserProps = Omit<User, 'password'> & { _id: any };

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<SafeUserProps | null> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const userObject = user.toObject();
      const { password: hashedPassword, ...result } = userObject;

      return result;
    }

    return null;
  }

  async login(user: SafeUserProps) {
    const payload = { email: user.email, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
