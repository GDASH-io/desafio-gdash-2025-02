import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";

@Controller("auth")
export class AuthController {
  constructor(private auth: AuthService) {}

  // POST /auth/login
  // Comentário: rota pública para obter token JWT
  @Post("login")
  async login(@Body() body: { email: string; password: string }) {
    try {
      return await this.auth.login(body.email, body.password);
    } catch (err) {
      // UnauthorizedException para credenciais inválidas
      throw err;
    }
  }
}
