import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
  ) {} 

  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() authDto: AuthDto) {
    return this.authService.signIn(authDto.email, authDto.password);
  }

  @Post('register')
  register(@Body() authDto: AuthDto) {
    return this.authService.register(authDto.email, authDto.password);
  }
}