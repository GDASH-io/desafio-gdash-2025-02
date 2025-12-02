import {
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Body,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Rota pública: Login
  @UseGuards(AuthGuard('local')) // Usa o LocalStrategy para validar senha antes de entrar
  @Post('login')
  async login(@Request() req, @Body() LoginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  // Exemplo de rota protegida (apenas para teste)
  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AuthGuard('jwt')) // Só quem está logado pode deslogar
  @Post('logout')
  async logout(@Request() req) {
    // Aqui  pode salvar um log no banco: "User X saiu às 14:00"

    return { message: 'Sessão encerrada com sucesso' };
  }
}
