// src/auth/auth.controller.ts

import { Body, Controller, Post, HttpCode, HttpStatus, UsePipes, ValidationPipe, UseGuards, Get, Request  } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service'; 
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private usersService: UsersService
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new ValidationPipe()) //Validação do dto
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.signIn(loginDto.email, loginDto.password);
  }

}