import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Token vem no Header Authorization
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!, // Chave secreta do .env
    });
  }

  async validate(payload: any) {
    // O que retornado aqui vai ficar disponível em `req.user` nas rotas protegidas
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
