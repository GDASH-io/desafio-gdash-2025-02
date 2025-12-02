import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../../services/users.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwt: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException("Credenciais inválidas");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException("Credenciais inválidas");

    // Retorna payload mínimo
    return { id: user._id, email: user.email, role: user.role };
  }

  async login(email: string, password: string) {
    const payload = await this.validateUser(email, password);
    const token = await this.jwt.signAsync(payload);
    return { access_token: token };
  }
}
