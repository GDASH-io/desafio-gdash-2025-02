import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { UserDocument } from '../users/schemas/user.schema';

type AuthenticatedUser = Omit<UserDocument, 'password_hash'> & {
  _id: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByEmail(email);

    if (user && user.is_active) {
      const isMatch = await this.usersService.comparePasswords(
        pass,
        user.password_hash,
      );

      if (isMatch) {
        const userObject = user.toObject({ getters: true }) as Record<
          string,
          any
        >;
        delete userObject.password_hash;
        return userObject as AuthenticatedUser;
      }
    }
    return null;
  }

  login(user: AuthenticatedUser) {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
