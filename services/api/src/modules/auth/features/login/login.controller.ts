import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginDto } from '../../dto/login.dto';
import { API_ROUTES } from '../../../../shared/constants/api-routes';

@Controller(API_ROUTES.AUTH.BASE)
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  @Post(API_ROUTES.AUTH.LOGIN)
  @HttpCode(HttpStatus.OK)
  login(@Body() loginDto: LoginDto) {
    return this.loginService.login(loginDto);
  }
}
