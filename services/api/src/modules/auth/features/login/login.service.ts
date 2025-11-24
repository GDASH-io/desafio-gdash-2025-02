import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { FindUsersService } from '../../../users/features/find-users/find-users.service';
import { LoginDto } from '../../dto/login.dto';
import { ERROR_MESSAGES } from '../../../../shared/constants/errors';

@Injectable()
export class LoginService {
  constructor(
    private findUsersService: FindUsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.findUsersService.validateUser(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException(ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const payload = {
      sub: user._id,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }
}
