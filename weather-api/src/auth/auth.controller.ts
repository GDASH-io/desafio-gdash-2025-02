import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

import { IsPublic } from 'decorators/IsPublic';
import { SignInDto } from './dto/signIn.dto';
import { SignUpDto } from './dto/signUp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic()
  @Post('signin')
  signin(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }
  @IsPublic()
  @Post('signup')
  signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }
}
