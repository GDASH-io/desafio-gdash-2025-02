import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { IsPublic } from 'src/common/decorators/IsPublic';
import { UserDocument } from '../users/infraestructure/schema/user.schema';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpUserDto } from './dto/sign-up.dto';

@Throttle({ default: { limit: 5, ttl: 15 * 60 * 1000 } }) // 5 requests per 15 minutes
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  signIn(@Body() signIn: SignInDto) {
    return this.authService.signIn(signIn);
  }

  @IsPublic()
  @Post('sign-up')
  async signUp(@Body() signUpUserDto: SignUpUserDto) {
    const user = await this.authService.signUp(signUpUserDto);
    return {
      ...this.mapUser(user.user),
      token: user.token,
    };
  }

  private mapUser(user: UserDocument[] | UserDocument) {
    if (Array.isArray(user)) {
      return user.map((u) => {
        return {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        };
      });
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
