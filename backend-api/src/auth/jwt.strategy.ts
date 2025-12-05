import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      // Extrai o token do cabeçalho Authorization: Bearer token
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Lê o secret do ConfigService (configurado no AuthModule)
      secretOrKey: configService.get<string>('JWT_SECRET'), 
    });
  }

  // Validação: o Passport chama este método após verificar a assinatura do token
  async validate(payload: any) {
    // Retorna o payload (que contém sub, username, name)
    return { userId: payload.sub, username: payload.username, name: payload.name };
  }
}
