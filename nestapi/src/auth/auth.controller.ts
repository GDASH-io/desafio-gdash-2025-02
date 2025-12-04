import { Body, Controller, Post, Res, BadRequestException } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import type { LoginDto } from './dto/login.dto';
import type { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() dto: RegisterDto & { latitude?: number; longitude?: number },
    @Res({ passthrough: true }) res: Response
  ) {
    const user = await this.authService.register(dto);

    res.cookie('userId', user.data._id.toString(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    if (dto.latitude && dto.longitude) {
      await this.authService.sendLocationToGo(
        user.data._id.toString(),
        dto.latitude,
        dto.longitude
      );
    }

    return user;
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto & { latitude?: number; longitude?: number },
    @Res({ passthrough: true }) res: Response
  ) {
    const token = await this.authService.login(dto);
    const user = await this.authService.getUserByEmail(dto.email);
    if (!user) throw new BadRequestException('User not found');

    res.cookie('userId', user._id.toString(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    if (dto.latitude && dto.longitude) {
      await this.authService.sendLocationToGo(
        user._id.toString(),
        dto.latitude,
        dto.longitude
      );
    }

    return token;
  }
}
