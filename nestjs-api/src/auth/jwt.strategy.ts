// src/auth/jwt.strategy.ts

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Define que o token será extraído do cabeçalho "Authorization" como um "Bearer Token"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      // Garante que tokens expirados sejam rejeitados
      ignoreExpiration: false,
      secretOrKey: '4a3aa4aeb3ba5e2f74933a5b106ca6c3',
    });
  }

  // Este método é chamado pelo Passport após validar o token com sucesso.
  // O payload decodificado do token é passado como argumento.
  async validate(payload: any) {
    // O objeto retornado aqui será anexado ao objeto `request.user`
    // e estará disponível em qualquer rota protegida.
    return { userId: payload.sub, email: payload.email };
  }
}